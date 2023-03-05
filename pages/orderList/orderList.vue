<template>
	<view class="order-list-page">
		<view class="order-item" v-for="item in list" :key="item.id">
			<view class="task-no">
				订单号: {{ item.orderno }}
			</view>
			<view class="task-no">
				sku: {{ item.sku }}
			</view>
			<view class="task-no">
				批次号: {{ item.batch_no }}
			</view>
			<view class="task-no">
				工厂: {{ item.factory_code }}
			</view>
			<view class="task-no">
				产线: {{ item.line }}
			</view>
			<view class="task-no">
				生产日期: {{ item.product_date }}
			</view>
			<view class="task-no full">
				创建日期: {{ item.create_date }}
			</view>
			<view class="item-btn" @click="goScan(item.id)">前往扫码</view>
			<view class="item-btn" @click="exportFile(item)">导出文件</view>
		</view>

		<view class="create-btn" @click="goDeatil()">创建订单</view>
	</view>
</template>

<script>
	import {
		queryOrderList,
		getAllItem
	} from '@/api/index.js'
	import XLSX from '@/static/xlsx.full.min.js'
	export default {
		data() {
			return {
				list: []
			};
		},
		methods: {
			goDeatil(id) {
				uni.navigateTo({
					url: `/pages/orderDeatil/orderDeatil?id=${id}`,
				})
			},
			goScan(id) {
				uni.navigateTo({
					url: `/pages/scanView/scanView?id=${id}`,
				})
			},
			async getList() {
				const list = await queryOrderList();
				console.log('list', list)
				this.list = list;
			},
			exportFile(orderItem) {
				// 查询订单下的瓶箱信息
				const data = [];
				uni.showActionSheet({
					itemList: ['1瓶装', '4瓶装', '12瓶装'],
					success: async (res) => {
						const typeList = [1, 4, 12];
						const type = typeList[res.tapIndex]

						const items = await getAllItem({
							type,
							orderId: orderItem.id
						});
						const productsInBox = items?.filter(item => item.status == 1);
						const boxMap = {};
						productsInBox.forEach(item => {
							if (boxMap[item.box_no]) {
								boxMap[item.box_no].push(item.item_no)
							} else {
								boxMap[item.box_no] = [item.item_no];
							}
						})
						const boxNumber = Object.keys(boxMap).length;
						console.log('boxNumber', boxNumber)
						if (boxNumber == 0) {
							uni.showToast({
								icon: 'error',
								title: '没有数据可以生成文件'
							})
							return
						}
						const textFileInfo = this.createTxt(orderItem, boxNumber, items)
						const excelFileInfo = this.createExcel(orderItem, items);
						uni.showLoading({
							title: '文件导出中...',
							mask: true
						})
						try {
							await this.writeFile(textFileInfo)
							await this.writeFile(excelFileInfo)
							uni.hideLoading()
							uni.showToast({
								title: '文件已保存到本地',
								icon: 'success',
							});
						} catch (error) {
							console.log('err', error)
							uni.hideLoading()
						}
					},
				})
			},
			createTxt(orderInfo, boxNumber, items) {
				const productDate = orderInfo.product_date.split('-').join('');
				let factoryCode = orderInfo.factory_code;
				const factoryCodeList = factoryCode.split(' ');
				if (factoryCodeList.length > 1) {
					factoryCode = factoryCodeList.join('#');
				}
				const fileName =
					`dat_MO#${orderInfo.sku}#${orderInfo.batch_no}#${productDate}#${orderInfo.line}#1_${factoryCode}_${orderInfo.line}_${productDate}144857224.txt`
				const line1 =
					`H,MO#${orderInfo.sku}#${orderInfo.batch_no}#${productDate}#${orderInfo.line}#1,${orderInfo.factory_code},${orderInfo.line},${orderInfo.sku},${orderInfo.batch_no},${orderInfo.product_date},${boxNumber}`
				const line2 = items.map((i, index) => {
					return `L,MO#${orderInfo.sku}#${orderInfo.batch_no}#${productDate}#${orderInfo.line}#1,${index + 1},${i.box_no},${i.item_no},${orderInfo.product_date} ${i.create_date}.000`
				}).join('\n')
				const fileContent = `${line1}\n${line2}`
				return {
					fileName,
					fileContent
				}

			},
			createExcel(orderInfo, items) {
				const orderNo = orderInfo.orderno || 'no_orderno';
				const excelFormatData = items.map(item => ({
					'订单号': orderNo,
					'条码信息': item.box_no,
					'产品代码': orderInfo.sku,
				}))
				const worksheet = XLSX.utils.json_to_sheet(excelFormatData);
				const htmlSheet = XLSX.utils.sheet_to_html(worksheet);
				const fileContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
			                       xmlns:x="urn:schemas-microsoft-com:office:excel"
			                       xmlns="http://www.w3.org/TR/REC-html40">
			                       <head><!--[if gte mso 9]><xml encoding="UTF-8"><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
			                       <x:Name>sheet1</x:Name>
			                       <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
			                       </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
			                       </head><body>${htmlSheet}</body>
								</html>`;
				return {
					fileName: `${orderNo}.xlsx`,
					fileContent
				}
			},
			writeFile({
				fileName,
				fileContent
			}) {
				console.log('fileName', fileName)
				return new Promise((resolve, reject) => {
					plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, (fs) => {
						fs.root.getFile(fileName, {
							create: true
						}, (fileEntry) => {
							fileEntry.createWriter((writer) => {
								writer.onwriteend = () => {
									resolve()
								};
								writer.onerror = (e) => {
									reject()
								};
								writer.write(fileContent);
							});
						}, (e) => {
							reject()
						});
					}, (e) => {
						reject()
					});
				});
			},
		},
		onShow() {
			this.getList();
		}
	}
</script>

<style lang="less">
	.order-list-page {
		padding: 10px 10px 60px;

		.create-btn {
			position: fixed;
			bottom: 0;
			left: 0;
			background-color: green;
			width: 100%;
			height: 45px;
			line-height: 45px;
			color: #fff;
			text-align: center;
			font-size: 14px;
		}

		.order-item {
			display: flex;
			border: 1px solid green;
			padding: 10px;
			border-radius: 5px;
			flex-wrap: wrap;
			font-size: 12px;
			margin-bottom: 5px;
		}

		.task-no {
			width: 50%;

			&.full {
				width: 100%;
			}
		}

		.item-btn {
			width: 45%;
			height: 34px;
			line-height: 34px;
			text-align: center;
			margin-top: 10px;
			background: green;
			border-radius: 5px;
			color: #fff;
			&:last-child {
				margin-left: 10%;
			}
		}
	}
</style>
