<template>
	<view class="countdown-container">
		<view class="time-display">{{ formattedTime }}</view>
		<button v-if="!isRunning" @click="startCountdown">开始倒计时</button>
		<button v-else @click="pauseCountdown">暂停倒计时</button>
		<button @click="resetCountdown">重置倒计时</button>
	</view>
</template>

<script>
	export default {
		name: 'BackgroundCountdown',
		props: {
			initialTime: {
				type: Number,
				default: 180,
				required: true
			}
		},
		data() {
			return {
				remainingSeconds: this.initialTime,
				totalSeconds: 60, // 默认60秒
				remainingSeconds: 60,
				timerId: null,
				isRunning: false,
				lastActiveTime: null
			}
		},
		computed: {
			formattedTime() {
				const minutes = Math.floor(this.remainingSeconds / 60);
				const seconds = this.remainingSeconds % 60;
				return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
			}
		},
		methods: {
			startCountdown() {
				const storedTime = uni.getStorageSync(`countdown_${this.detailData.id}`);
				if (storedTime) {
					this.remainingSeconds = storedTime;
				}
				if (this.isRunning) return;

				this.isRunning = true;
				this.lastActiveTime = new Date();
				this.remainingSeconds = this.initialTime;
				// 先执行一次更新
				this.updateCountdown();

				// 使用setInterval每秒更新一次
				this.timerId = setInterval(() => {
					this.updateCountdown();
				}, 1000);

				// 监听页面隐藏/显示事件
				uni.onAppShow(() => {
					this.onAppShow();
				});

				uni.onAppHide(() => {
					this.onAppHide();
				});
			},

			pauseCountdown() {
				if (!this.isRunning) return;

				clearInterval(this.timerId);
				this.timerId = null;
				this.isRunning = false;
			},

			resetCountdown() {
				this.pauseCountdown();
				this.remainingSeconds = this.initialTime;
			},

			updateCountdown() {
				uni.setStorageSync(`countdown_${this.detailData.id}`, this.remainingSeconds);
				if (this.remainingSeconds <= 0) {
					this.pauseCountdown();
					this.$emit('countdown-end');
					return;
				}

				this.remainingSeconds--;
			},

			onAppShow() {
				// 应用从后台切回前台时
				const currentTime = new Date();
				const timeDiff = Math.floor((currentTime - this.lastActiveTime) / 1000);

				if (timeDiff > 0 && this.isRunning) {
					// 扣除后台运行的时间
					this.remainingSeconds = Math.max(0, this.remainingSeconds - timeDiff);

					if (this.remainingSeconds <= 0) {
						this.pauseCountdown();
					}
				}

				this.lastActiveTime = currentTime;
			},

			onAppHide() {
				// 应用进入后台时记录时间
				this.lastActiveTime = new Date();
			}
		},
		beforeDestroy() {
			// 组件销毁前清除定时器
			this.pauseCountdown();
		}
	}
</script>

<style scoped>
	.countdown-container {
		padding: 20px;
		text-align: center;
	}

	.time-display {
		font-size: 24px;
		font-weight: bold;
		margin-bottom: 20px;
	}

	button {
		margin: 5px;
		padding: 10px 20px;
	}
</style>