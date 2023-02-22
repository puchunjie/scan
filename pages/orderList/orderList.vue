<template>
	<view class="order-list-page">
		<view class="order-item" v-for="item in list" :key="item.id">
			<view class="task-no">
				sku: {{ item.sku }}
			</view>
			<view class="task-no">
				批次号: {{ item.batchNumber }}
			</view>
			<view class="task-no">
				工厂: {{ item.factoryCode }}
			</view>
			<view class="task-no">
				产线: {{ item.productionLine }}
			</view>
			<view class="task-no">
				生产日期: {{ item.productionDate }}
			</view>
			<view class="task-no">
				创建日期: {{ item.createTime }}
			</view>
			<view class="item-btn" @click="goScan(item.id)">前往扫码</view>
			<view class="item-btn" @click="exportFile(item.id)">导出文件</view>
		</view>

		<view class="create-btn" @click="goDeatil()">创建订单</view>
	</view>
</template>

<script>
	import { SQLite1 } from '@/api/index.js'
	console.log(SQLite1)
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
			getList() {
				this.list = [{
					id: '1',
					createTime: '2022-02-22 16:22',
					batchNumber: '23230211',
					productionDate: "2021-12-22",
					factoryCode: 'TC PLANT',
					productionLine: 'C61',
					sku: '3430385',
				}, {
					id: '12323',
					createTime: '2022-02-22 16:22',
					batchNumber: '23230211',
					productionDate: "2021-12-22",
					factoryCode: 'TC PLANT',
					productionLine: 'C61',
					sku: '3430385',
				}]
			},
			exportFile(id) {
				// 查询订单下的瓶箱信息
				const data = [];
				uni.showActionSheet({
					itemList: ['4瓶装', '12瓶装'],
					success: function(res) {
						const typeList = [4, 12];
						const type = typeList[res.tapIndex]
						uni.showLoading({
							title: '文件导出中...',
							mask: true
						})
						
						setTimeout(() => {
							uni.hideLoading()
						}, 2000)
					},
				})
			}
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
		}

		.item-btn {
			width: 45%;
			height: 34px;
			line-height: 34px;
			text-align: center;
			margin-right: 5%;
			margin-top: 10px;
			background: green;
			border-radius: 5px;
			color: #fff;
		}
	}
</style>
