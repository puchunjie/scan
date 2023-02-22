<template>
	<view class="scan-page">
		<view class="boxs-warp">
			<view class="box" :class="boxIn && 'filled'" v-for="boxIn in boxs">{{ boxIn ? '满' : '空' }}</view>
		</view>
		<view class="count">本箱状态：{{ filledNum }}/{{ boxSize }}</view>
		<view class="box-full-tip" v-show="isFull">请扫描箱子条形码,完成装箱</view>


		<view class="btn-group">
			<view class="btn" @click="changeSize(4)">4个装</view>
			<view class="btn" @click="changeSize(12)">12个装</view>
			<view class="btn" @click="goList">完成扫码</view>
		</view>

		<!-- <view class="btn" @click="fillBox">addOne</view> -->
	</view>
</template>

<script>
	const BOX4 = 4;
	const BOX12 = 12;
	export default {
		data() {
			return {
				boxSize: BOX4,
				boxs: [],
				packed: false, // 是否完成箱子扫码
			};
		},
		computed: {
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
			init() {
				// 初始化箱子
				const boxs = new Array(this.boxSize).fill(false);
				this.boxs = boxs;
			},
			changeSize(size) {
				this.boxSize = size;
				this.init();
			},
			fillBox() {
				if (this.isFull) {
					return
				}
				this.$set(this.boxs, this.filledNum, true)
			},
			xwScan(res) {
				let ScanVal = res.code.replace(/\n|\r/g, "");
				if (ScanVal) {
					// do someting
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
				width: 30%;
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
