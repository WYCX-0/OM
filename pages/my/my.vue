<template>
	<view class="container">
		<!-- 个人信息 -->
		<view class="info-section">
			<view class="info-item">
				<text class="label">姓名：</text>
				<text class="value">{{info.name}}</text>
			</view>
			<view class="info-item">
				<text class="label">工号：</text>
				<text class="value">{{info.engineerNo}}</text>
			</view>
			<view class="info-item">
				<text class="label">电话：</text>
				<text class="value">{{info.phone}}</text>
			</view>
		</view>

		<!-- 状态卡片 -->
		<view class="status-container">
			<view class="status-box pending">
				<text class="number">{{to.no}}</text>
				<text class="text">待处理</text>
			</view>
			<view class="status-box completed">
				<text class="number">{{to.yes}}</text>
				<text class="text">已完成</text>
			</view>
			<view class="status-box total">
				<text class="number">{{to.total}}</text>
				<text class="text">总工单</text>
			</view>
		</view>

		<!-- 修改密码按钮 -->
		<button class="change-password-btn" @tap="changePassword">修改密码</button>
	</view>
</template>

<script>
	import {
		baseConfig
	} from '../../utils/config';

	export default {
		data() {
			return {
				token: '',
				id: '',
				info: {
					name: '',
					phone: '',
					engineerNo: ''
				},
				to: {
					no: 0,
					yes: 0,
					total: 0
				},
				loading: true, // 添加加载状态
				error: null // 添加错误处理
			}
		},
		onLoad() {
			this.initData(); // 调用初始化数据方法
		},
		methods: {
			async initData() {
				try {
					// 获取token和id
					this.getAccessToken();

					// 验证token和id是否存在
					if (!this.token || !this.id) {
						throw new Error('用户凭证缺失，请重新登录');
					}

					// 并行发送请求（使用Promise.all同时获取数据）
					await Promise.all([
						this.getInfo(),
						this.getTotal()
					]);

				} catch (err) {
					this.error = err.message;
					console.error('数据加载失败:', err);
				} finally {
					this.loading = false;
				}
			},
			getAccessToken() {
				this.token = uni.getStorageSync('token');
				this.id = uni.getStorageSync('id');
				console.log('用户ID:', this.id);
			},
			getInfo() {
				return new Promise((resolve, reject) => {
					uni.request({
						url: `${baseConfig.baseUrl}/engineer/my/info/${this.id}`,
						method: 'GET',
						header: {
							'Authorization': `Bearer ${this.token}`
						},
						success: (res) => {
							if (res.data.code === 200) {
								this.info = {
									...this.info,
									name: res.data.data.name || '未设置',
									phone: res.data.data.phone || '未设置',
									engineerNo: res.data.data.engineerNo || '未设置'
								};
								resolve();
							} else {
								reject(new Error(`获取个人信息失败: ${res.data.message}`));
							}
						},
						fail: (err) => {
							reject(err);
						}
					});
				});
			},
			getTotal() {
				return new Promise((resolve, reject) => {
					uni.request({
						url: `${baseConfig.baseUrl}/engineer/my/random/${this.id}`,
						method: 'GET',
						header: {
							'Authorization': `Bearer ${this.token}`
						},
						success: (res) => {
							if (res.data.code === 200) {
								this.to = {
									no: res.data.data.no || 0,
									yes: res.data.data.yes || 0,
									total: res.data.data.total || 0
								};
								resolve();
							} else {
								reject(new Error(`获取统计信息失败: ${res.data.message}`));
							}
						},
						fail: (err) => {
							reject(err);
						}
					});
				});
			},
			changePassword() {
				uni.navigateTo({
					url: '/pages/password/password'
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
	}

	.info-section {
		background: #fff;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 20px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.info-item {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		font-size: 16px;
	}

	.label {
		color: #666;
		width: 80px;
	}

	.value {
		color: #333;
		font-weight: 500;
	}

	.status-container {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.status-box {
		flex: 1;
		margin: 0 5px;
		padding: 15px;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #fff;
	}

	.pending {
		background: #FFA726;
		/* 橙色 */
	}

	.completed {
		background: #4CAF50;
		/* 绿色 */
	}

	.total {
		background: #2196F3;
		/* 蓝色 */
	}

	.number {
		font-size: 24px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.text {
		font-size: 14px;
	}

	.change-password-btn {
		background: #673AB7;
		color: #fff;
		border-radius: 25px;
		margin-top: 20px;
	}

	/* 新增加载状态样式 */
	.loading-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(255, 255, 255, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}

	.loading-text {
		font-size: 18px;
		color: #333;
	}
</style>