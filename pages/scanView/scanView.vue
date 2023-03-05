<template>
	<view class="scan-page">
		<view class="boxs-warp" :class="boxSize === 1 && 'box1'">
			<view class="box" :class="boxIn && 'filled'" v-for="boxIn in boxs">{{ boxIn ? '满' : '空' }}</view>
		</view>
		<view class="count">本箱状态：{{ filledNum }}/{{ boxSize }}</view>
		<view class="count">已装箱数：{{ packageBoxNumber }}</view>
		<view class="box-full-tip" v-show="isFull">请扫描箱子条形码,完成装箱</view>


		<view class="btn-group">
			<view class="btn" @click="changeSize(1)">1个装</view>
			<view class="btn" @click="changeSize(4)">4个装</view>
			<view class="btn" @click="changeSize(12)">12个装</view>
			<view class="btn" @click="goList">完成扫码</view>
		</view>

		<xw-scan></xw-scan>
		<!-- <view class="btn" @click="fillBox">addOne</view> -->
	</view>
</template>

<script>
	const xwscan = uni.requireNativePlugin("xw-scan");
	import {
		scanOne,
		getAllItem,
	} from '@/api/index.js'
	
	const BOX1 = 1;
	const BOX4 = 4;
	const BOX12 = 12;
	export default {
		data() {
			return {
				boxSize: BOX1,
				boxs: [],
				packageBoxNumber: 0, 
			};
		},
		computed: {
			id() {
				const pages = getCurrentPages();
				const currentPage = pages[pages.length - 1];
				const route = currentPage.route;
				const query = currentPage.options;
				return query.id
			},
			filledNum() {
				return this.boxs.filter(done => done).length || 0
			},
			isFull() {
				return this.filledNum === this.boxSize
			},
		},
		methods: {
			goList() {
				uni.navigateTo({
					url: '/pages/orderList/orderList'
				})
			},
			async init() {
				// 初始化箱子
				const boxs = new Array(this.boxSize).fill(false);
				this.boxs = boxs;
				const items = await getAllItem({
					orderId: this.id,
					type: this.boxSize
				});
				console.log('items', items)
				const needFillNumer = items.filter(i => i.status == 0)?.length || 0;
				console.log('needFillNumer', needFillNumer)
				needFillNumer && this.fillBox(needFillNumer);
				const packageBoxList = [...new Set(items.filter(item => item.box_no != -1 && item.status > 0).map(
					item => item.box_no))]
				this.packageBoxNumber = packageBoxList?.length || 0;
			},
			changeSize(size) {
				this.boxSize = size;
				this.init();
			},
			fillBox(num = 1) {
				if (this.isFull) {
					return
				}
				if (num > 1) {
					this.boxs = this.boxs.map((done, index) => {
						return index < num
					})
				} else {
					this.$set(this.boxs, this.filledNum, true)
				}
			},
			async xwScan(res) {
				const scanNo = res.code.replace(/\n|\r/g, "");
				if (scanNo) {
					const [success, isItem, e] = await scanOne(this.id, scanNo, this.boxSize)
					if (success) {
						if (isItem) {
							this.fillBox()
						} else {
							this.init();
						}
					} else {
						uni.showToast({
							icon: 'error',
							title: e
						})
					}
				};
			}
		},
		onShow() {
			uni.$off('xwscan');
			uni.$on('xwscan', this.xwScan);
			this.init();
		},

		onUnload() {
			uni.$off('xwscan'); //移除监听事件
		},
	}
</script>

<style lang="less">
	.scan-page {
		padding: 10px 10px 60px;

		.boxs-warp {
			display: flex;
			flex-wrap: wrap;

			.box {
				width: 20%;
				height: 60px;
				line-height: 60px;
				background-color: #666;
				box-sizing: border-box;
				margin: 0 2.5% 20px 2.5%;
				text-align: center;
				color: #fff;
				font-size: 12px;

				&.filled {
					background-color: green;
				}
			}
			
			&.box1 {
				.box {
					width: 70%;
					height: 120px;
					line-height: 120px;
					margin: 0 auto 20px;
				}
			}
		}

		.count {
			text-indent: 10px;
		}

		.box-full-tip {
			margin: 10px auto;
			width: 96%;
			height: 30px;
			line-height: 30px;
			font-size: 14px;
			background-color: red;
			color: #fff;
			text-align: center;
			border-radius: 5px;
		}

		.btn-group {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 45px;
			line-height: 45px;
			font-size: 14px;
			display: flex;
			justify-content: space-between;
			color: #fff;
			padding: 0 10px;
			box-sizing: border-box;

			.btn {
				width: 23%;
				height: 100%;
				text-align: center;
				background-color: green;
				border-radius: 4px;

				&.disabled {
					background-color: #999;
				}
			}
		}
	}
</style>
