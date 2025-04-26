<template>
	<view class="container">
		<view class="form-card">
			<view class="form-item">
				<text class="form-label">备件详情：</text>
				<textarea v-model="form.detail" placeholder="请输入备件详细信息" class="form-textarea" auto-height></textarea>
			</view>
			<button class="submit-button" hover-class="button-hover" @click="submitApplication">
				提交申请
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					orderId: '',
					detail: ''
				}
			};
		},
		onLoad(options) {
			this.form.orderId = options.orderId;
		},
		methods: {
			async submitApplication() {
				if (!this.form.detail.trim()) {
					uni.showToast({
						title: '请填写备件详情',
						icon: 'none'
					});
					return;
				}

				const token = uni.getStorageSync('token');
				const res = await uni.request({
					url: 'http://192.168.47.195:9090/engineer/spare/add',
					method: 'POST',
					header: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					data: {
						failId: this.form.orderId,
						detail: this.form.detail
					}
				});

				if (res.data.code === 200) {
					uni.showToast({
						title: '申请提交成功',
						icon: 'success'
					});


					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({
						title: res.data.msg || '提交失败',
						icon: 'none'
					});
				}
			}
		}
	};
</script>

<style scoped>
	.container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	.form-card {
		background-color: white;
		border-radius: 16rpx;
		padding: 30rpx;
		margin: 20rpx;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.form-label {
		font-size: 28rpx;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.form-textarea {
		width: 100%;
		min-height: 200rpx;
		padding: 20rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		font-size: 28rpx;
	}

	.submit-button {
		background: #1890ff;
		color: white;
		border-radius: 8rpx;
		margin-top: 40rpx;
	}

	.button-hover {
		opacity: 0.8;
	}
</style>