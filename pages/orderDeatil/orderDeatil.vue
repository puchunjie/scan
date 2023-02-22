<template>
	<view class="form-page">
		<view class="form-group">
			<view class="label">SKU</view>
			<view class="value">
				<input v-model="formData.sku" />
			</view>
		</view>
		<view class="form-group">
			<view class="label">批次号</view>
			<view class="value">
				<input v-model="formData.batchNo" />
			</view>
		</view>
		<view class="form-group">
			<view class="label">工厂</view>
			<view class="value">
				<input v-model="formData.factoryCode" />
			</view>
		</view>
		<view class="form-group">
			<view class="label">产线</view>
			<view class="value">
				<input v-model="formData.line" />
			</view>
		</view>
		<view class="form-group">
			<view class="label">生产日期</view>
			<view class="value">
				<!-- <input v-model="formData.productionDate" /> -->
				<picker class="date-picker" mode="date" :value="formData.productDate" @change="bindDateChange">
					<view class="uni-input">{{formData.productDate}}</view>
				</picker>
			</view>
		</view>

		<view class="create-btn" @click="submit()">提交订单</view>
	</view>
</template>

<script>
	import {
		createOrder
	} from '@/api/index.js'
	export default {
		data() {
			return {
				formData: {
					batchNo: '23230211',
					productDate: "2021-12-22",
					factoryCode: 'TC PLANT',
					line: 'C61',
					sku: '3430385',
				}
			};
		},
		computed: {
			isAdd() {
				const pages = getCurrentPages();
				const currentPage = pages[pages.length - 1];
				const route = currentPage.route;
				const query = currentPage.options;
				return query.id === undefined
			}
		},
		methods: {
			async submit() {
				if (Object.keys(this.formData).some(key => !this.formData[key])) {
					uni.showToast({
						title: '请填写完整表单！'
					})
					return
				}

				console.log(this.formData);
				const [success, e] = await createOrder(this.formData)
				console.log(success, e)
				if (success) {
					uni.navigateBack();
					return
				}
				uni.showToast({
					icon: "error",
					title: e
				})

			},
			bindDateChange(e) {
				const date = e?.detail?.value || ''
				this.formData.productionDate = date;
			}
		}
	}
</script>

<style lang="less">
	.form-page {
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

		.form-group {
			font-size: 14px;
			margin-bottom: 20px;

			.label {
				color: #999;
			}

			.value {
				width: 100%;
				height: 40px;
				border: 1px solid #ddd;
				border-radius: 5px;
				margin-top: 5px;

				input {
					display: block;
					width: 100%;
					height: 100%;
					outline: none;
					border: 0;
					padding: 0 10px;
				}

				.date-picker {
					font-size: 14px;
					margin: 10px 0 0 10px;
				}
			}
		}
	}
</style>
