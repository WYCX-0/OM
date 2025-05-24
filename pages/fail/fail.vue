<template>
	<view class="form-container">
		<!-- 报修表单头部 -->
		<view class="form-header">
			<text class="form-title">设备报修单</text>
		</view>

		<!-- 表单主体 -->
		<view class="form-body">
			<!-- 报修细节 -->
			<view class="form-item">
				<text class="label">报修细节</text>
				<view class="detail-input">
					<input type="text" placeholder="请输入报修细节" v-model="form.detail" class="input" />
				</view>
			</view>

			<!-- 报修设备 -->
			<view class="form-item">
				<text class="label">报修设备</text>
				<picker @change="deviceChange" :value="deviceIndex" :range="deviceOptions" range-key="name"
					class="device-picker">
					<view class="picker">
						{{ deviceIndex !== -1 ? deviceOptions[deviceIndex].name : '请选择报修设备' }}
						<i class="fa fa-chevron-down picker-icon"></i>
					</view>
				</picker>
			</view>

			<!-- 上传图片 -->
			<view class="form-item">
				<text class="label">故障图片</text>
				<view class="upload-container" :class="{'has-image': form.beforeUrl}">
					<!-- 没有图片时显示上传区域 -->
					<view v-if="!form.beforeUrl" class="upload-area" @click="chooseImage">
						<i class="fa fa-camera upload-icon"></i>
						<text class="upload-text">点击上传图片</text>
					</view>

					<!-- 有图片时显示图片，并可点击重新上传 -->
					<view v-else class="repair-image-container" @click="chooseImage">
						<image :src="form.beforeUrl" mode="aspectFill" class="repair-image"></image>
						<view class="image-overlay">
							<text class="overlay-text">点击更换图片</text>
						</view>
					</view>
				</view>
				<text class="image-hint">请上传能清晰显示故障的图片</text>
			</view>

			<!-- 提交按钮 -->
			<button :disabled="!isFormValid || isSubmitting" :class="{'btn-disabled': !isFormValid || isSubmitting}"
				type="primary" class="submit-btn" @click="submitForm">
				<text v-if="isSubmitting">提交中...</text>
				<text v-else>提交报修</text>
			</button>
		</view>
	</view>
</template>

<script>
	import {
		baseConfig
	} from '../../utils/config';

	export default {
		data() {
			return {
				form: {
					detail: '',
					deviceId: '',
					beforeUrl: '',
					additionalInfo: ''
				},
				deviceOptions: [],
				deviceIndex: -1,
				isSubmitting: false,
				tempFilePath: null
			};
		},
		computed: {
			isFormValid() {
				return (
					this.form.detail.trim() !== '' &&
					this.form.deviceId !== '' &&
					this.form.beforeUrl !== ''
				);
			}
		},
		onLoad() {
			this.getDeviceOptions();
		},
		methods: {
			// 获取设备列表
			getDeviceOptions() {
				uni.showLoading({
					title: '加载中...'
				});

				uni.request({
					url: `${baseConfig.baseUrl}/user/device/get`,
					method: 'GET',
					success: (res) => {
						uni.hideLoading();

						if (res.data.code === 200) {
							this.deviceOptions = res.data.data.map(device => ({
								id: device.id,
								name: device.name
							}));

							if (this.deviceOptions.length > 0 && this.deviceIndex === -1) {
								// 默认选择第一个设备
								this.deviceIndex = 0;
								this.form.deviceId = this.deviceOptions[0].id;
							}
						} else {
							uni.showToast({
								title: '获取设备列表失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						uni.hideLoading();
						console.error('获取设备列表失败', err);
						uni.showToast({
							title: '获取设备列表失败，请检查网络连接',
							icon: 'none'
						});
					}
				});
			},

			// 设备选择变更
			deviceChange(e) {
				this.deviceIndex = e.detail.value;
				this.form.deviceId = this.deviceOptions[this.deviceIndex].id;
			},

			// 选择并上传图片
			chooseImage() {
				const that = this;
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.tempFilePath = res.tempFilePaths[0];
						this.form.beforeUrl = this.tempFilePath; // 立即显示临时图片

						uni.showLoading({
							title: '图片上传中...'
						});

						uni.uploadFile({
							url: `${baseConfig.baseUrl}/upload`,
							filePath: this.tempFilePath,
							name: 'file',
							header: {
								'Content-Type': 'multipart/form-data'
							},
							success: (uploadRes) => {
								uni.hideLoading();

								try {
									const data = JSON.parse(uploadRes.data);
									if (data.code === 200) {
										this.form.beforeUrl = data.data; // 成功后更新为服务器路径
										uni.showToast({
											title: '图片上传成功'
										});
									} else {
										this.form.beforeUrl = ''; // 失败时清除路径
										uni.showToast({
											title: '上传失败: ' + data.msg,
											icon: 'none'
										});
									}
								} catch (e) {
									this.form.beforeUrl = '';
									uni.showToast({
										title: '上传失败，服务器响应格式错误',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								this.form.beforeUrl = '';
								uni.hideLoading();
								uni.showToast({
									title: '上传失败，请检查网络连接',
									icon: 'none'
								});
							}
						});
					}
				});
			},

			submitForm() {
				if (!this.isFormValid) {
					uni.showToast({
						title: '请填写必填字段',
						icon: 'none'
					});
					return;
				}

				this.isSubmitting = true;

				uni.request({
					url: `${baseConfig.baseUrl}/user/fail/add`,
					method: 'POST',
					data: this.form,
					success: (response) => {
						this.isSubmitting = false;

						if (response.data.code === 200) {
							uni.showToast({
								title: '报修完成',
								icon: 'success'
							});
							// 重置表单
							this.form.detail = '';
							this.form.beforeUrl = '';
							this.form.deviceId = this.deviceOptions.length > 0 ? this.deviceOptions[0].id : '';
							this.deviceIndex = this.deviceOptions.length > 0 ? 0 : -1;
						} else {
							uni.showToast({
								title: '提交失败: ' + response.data.msg,
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						this.isSubmitting = false;
						uni.showToast({
							title: '网络请求失败，请检查连接',
							icon: 'none'
						});
						console.error('请求失败详情:', err);
					}
				});
			}
		}
	};
</script>

<style scoped>
	.form-container {
		padding: 20px 15px;
		max-width: 600px;
		margin: 0 auto;
	}

	.form-header {
		margin-bottom: 30px;
		text-align: center;
	}

	.form-title {
		font-size: 20px;
		font-weight: bold;
		color: #333;
		margin-bottom: 8px;
	}

	.form-body {
		background-color: #fff;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.form-item {
		margin-bottom: 25px;
	}

	.label {
		display: block;
		margin-bottom: 10px;
		font-size: 15px;
		font-weight: 500;
		color: #333;
	}

	/* 设备选择器样式 */
	.device-picker .picker {
		padding: 12px 15px;
		border: 1px solid #e4e7ed;
		border-radius: 6px;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		color: #333;
		width: 100%;
	}

	.device-picker .picker-icon {
		color: #999;
		transition: transform 0.3s;
	}

	.device-picker .picker:active .picker-icon {
		transform: rotate(180deg);
	}

	/* 报修细节输入框样式 */
	.detail-input {
		padding: 12px 15px;
		border: 1px solid #e4e7ed;
		border-radius: 6px;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		color: #333;
		width: 100%;
	}

	.detail-input .input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 14px;
		color: #333;
	}

	/* 上传图片样式 */
	.upload-container {
		border: 1px dashed #d9d9d9;
		border-radius: 8px;
		width: 120px;
		height: 120px;
		position: relative;
		overflow: hidden;
		margin-top: 10px;
	}

	.upload-container.has-image {
		border: none;
	}

	.upload-area {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f8fafc;
		cursor: pointer;
	}

	.upload-area:active {
		background-color: #f0f2f5;
	}

	.upload-icon {
		font-size: 24px;
		color: #909399;
		margin-bottom: 6px;
	}

	.upload-text {
		color: #909399;
		font-size: 12px;
	}

	.repair-image-container {
		width: 100%;
		height: 100%;
		position: relative;
		cursor: pointer;
	}

	.repair-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px;
		transition: transform 0.3s;
	}

	.repair-image-container:hover .repair-image {
		transform: scale(1.05);
	}

	.image-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.6);
		color: white;
		padding: 6px;
		text-align: center;
		opacity: 0;
		transition: opacity 0.3s;
		border-radius: 0 0 8px 8px;
	}

	.repair-image-container:hover .image-overlay {
		opacity: 1;
	}

	.overlay-text {
		font-size: 12px;
	}

	.image-hint {
		display: block;
		margin-top: 8px;
		font-size: 12px;
		color: #999;
	}

	.submit-btn {
		width: 100%;
		padding: 12px 0;
		border-radius: 8px;
		background-color: #1677ff;
		color: white;
		font-size: 16px;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: all 0.3s;
		margin-top: 10px;
	}

	.submit-btn:active {
		transform: translateY(2px);
	}

	.submit-btn.btn-disabled {
		background-color: #a8cfff;
		cursor: not-allowed;
	}
</style>