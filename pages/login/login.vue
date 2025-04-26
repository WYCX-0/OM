<template>
	<view class="container">
		<view class="brand-container">
			<text class="brand-text">运</text>
			<text class="brand-text accent">维</text>
		</view>

		<view class="form-box">
			<view class="input-item">
				<input type="text" placeholder="请输入工号" v-model="engineerNo" class="input" />
			</view>
			<view class="input-item">
				<input type="password" placeholder="请输入密码" v-model="password" class="input" />
			</view>
			<button class="submit-btn" @click="handleLogin">登录</button>
		</view>
	</view>
</template>

<script>
	import {
		websocketObj
	} from '../../utils/websocket';
	export default {
		data() {
			return {
				engineerNo: '',
				password: ''
			};
		},
		methods: {
			handleLogin() {
				if (!this.engineerNo || !this.password) {
					uni.showToast({
						title: '请填写完整登录信息',
						icon: 'none'
					});
					return;
				}

				uni.request({
					url: 'http://192.168.245.195:9090/engineer/login',
					method: 'POST',
					data: {
						engineerNo: this.engineerNo,
						password: this.password
					},
					success: (res) => {
						if (res.data.code === 200) {
							uni.setStorageSync('userInfo', {
								id: res.data.data.id,
								name: res.data.data.name
							});
							uni.setStorageSync('token', res.data.data.token);

							const wsURL = `ws://192.168.245.195:9090/ws/engineer/${res.data.data.id}`;
							websocketObj.connect(wsURL, res.data.data.token);

							uni.showToast({
								title: '登录成功',
								icon: 'success'
							});
							uni.reLaunch({
								url: '/pages/index/index'
							});
						} else {
							uni.showToast({
								title: res.data.msg || '登录失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('登录请求失败', err);
						uni.showToast({
							title: '网络错误，请稍后重试',
							icon: 'none'
						});
					}
				});
			}
		}
	};
</script>

<style scoped>
	.container {
		padding: 0;
		background-color: #f5f5f5;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.brand-container {
		text-align: center;
		margin: 10vh 0 5vh;
		animation: fadeInDown 0.6s;
	}

	.brand-text {
		font-size: 8vw;
		font-weight: 600;
		color: #333;
		letter-spacing: 1vw;
		position: relative;
	}

	.brand-text.accent {
		color: #4A90E2;
		margin-left: 1vw;
	}

	.brand-text::after {
		content: '';
		position: absolute;
		bottom: -1vh;
		left: 50%;
		transform: translateX(-50%);
		width: 60%;
		height: 0.5vh;
		background: linear-gradient(90deg, transparent, #4A90E2, transparent);
	}

	.avatar-box {
		display: flex;
		justify-content: center;
		margin: 5vh 0;
	}

	.avatar {
		width: 25vw;
		height: 25vw;
		border-radius: 1vw;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.form-box {
		padding: 5vw;
		background-color: #f9f9f9;
		border-radius: 3vw;
		box-shadow: 0 0 2vw rgba(0, 0, 0, 0.1);
		margin: 0 5vw;
		width: 80vw;
		max-width: 600rpx;
	}

	.input-item {
		margin-bottom: 3vh;
		border-bottom: 1px solid #EFEFEF;
		padding-bottom: 2vh;
	}

	.input {
		height: 8vh;
		font-size: 4vw;
		padding: 0 1vw;
		width: 100%;
		box-sizing: border-box;
	}

	.submit-btn {
		height: 10vh;
		background-color: #4A90E2;
		color: #FFFFFF;
		font-size: 4.5vw;
		border-radius: 5vh;
		margin-top: 5vh;
		box-shadow: 0 0 2vw rgba(74, 144, 226, 0.2);
		transition: background-color 0.3s ease;
		width: 100%;
	}

	.submit-btn:hover {
		background-color: #357ABD;
	}

	.register-link {
		text-align: center;
		margin-top: 3vh;
		font-size: 3.5vw;
		color: #666;
	}

	@keyframes fadeInDown {
		from {
			opacity: 0;
			transform: translateY(-2vh);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>