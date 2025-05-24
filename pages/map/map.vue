<template>
	<view class="map-container">
		<!-- 地图组件 -->
		<map id="mapContainer" :latitude="centerLat" :longitude="centerLng" :markers="markers" :circles="circles"
			:scale="16" :show-location="true" style="width: 100%; height: 100vh">
		</map>

		<!-- 使用普通view覆盖按钮 -->
		<view class="button-container">
			<button class="nav-button" @click="openNavigation">导航</button>
			<button class="nav-button back-button" @click="goBack">返回</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				centerLng: 116.397428, // 默认北京中心坐标
				centerLat: 39.90923,
				radius: 100, // 电子围栏半径
				markers: [], // 地图标记
				circles: [], // 电子围栏圆形
				mapCtx: null, // 地图上下文
				locationInterval: null // 定位定时器
			};
		},
		onLoad(options) {
			// 接收页面参数
			if (options.lng && options.lat) {
				this.centerLng = parseFloat(options.lng);
				this.centerLat = parseFloat(options.lat);
			}
			if (options.radius) {
				this.radius = parseFloat(options.radius);
			}

			this.initMap();
			this.startLocationWatch();
		},
		methods: {
			// 初始化地图
			async initMap() {
				this.mapCtx = uni.createMapContext('mapContainer', this);

				// 绘制电子围栏
				this.circles = [{
					latitude: this.centerLat,
					longitude: this.centerLng,
					radius: this.radius,
					strokeWidth: 2,
					strokeColor: '#FF0000',
					fillColor: '#FF000033'
				}];

				// 添加设备标记
				this.markers.push({
					id: 0,
					latitude: this.centerLat,
					longitude: this.centerLng,
					iconPath: '/static/device-marker.png',
					width: 40,
					height: 40,
					title: '电子围栏中心'
				});

				// 获取并更新用户位置
				try {
					const location = await this.getCurrentLocation();
					this.updateUserPosition(location);
				} catch (e) {
					uni.showToast({
						title: '获取位置失败',
						icon: 'none'
					});
				}
			},

			// 获取当前位置
			getCurrentLocation() {
				return new Promise((resolve, reject) => {
					uni.getLocation({
						type: 'gcj02',
						altitude: true,
						success: resolve,
						fail: reject
					});
				});
			},

			// 更新用户位置标记
			updateUserPosition(location) {
				const userMarker = {
					id: 1,
					latitude: location.latitude,
					longitude: location.longitude,
					iconPath: '/static/user-marker.png',
					width: 30,
					height: 30,
					title: '我的位置'
				};

				// 保留设备标记，更新用户标记
				this.markers = [this.markers[0], userMarker];

				// 调整地图视野
				this.mapCtx.includePoints({
					points: [{
							latitude: this.centerLat,
							longitude: this.centerLng
						},
						{
							latitude: location.latitude,
							longitude: location.longitude
						}
					],
					padding: [40, 40, 80, 40] // 下边距加大给按钮留空间
				});
			},

			// 开启持续定位
			startLocationWatch() {
				this.locationInterval = setInterval(async () => {
					try {
						const location = await this.getCurrentLocation();
						this.updateUserPosition(location);
					} catch (e) {
						console.error('位置更新失败:', e);
					}
				}, 5000);
			},

			// 打开地图导航
			openNavigation() {
				uni.openLocation({
					latitude: this.centerLat,
					longitude: this.centerLng,
					name: '电子围栏中心',
					address: '目标位置',
					scale: 18
				});
			},

			// 返回上一页
			goBack() {
				uni.navigateBack({
					delta: 1
				});
			}
		},
		onUnload() {
			// 清除定时器
			clearInterval(this.locationInterval);
			this.mapCtx = null;
		}
	};
</script>

<style>
	.map-container {
		position: relative;
		width: 100%;
		height: 100vh;
	}

	/* 按钮容器样式 */
	.button-container {
		position: fixed;
		bottom: calc(60rpx + env(safe-area-inset-bottom));
		left: 30rpx;
		right: 30rpx;
		display: flex;
		gap: 30rpx;
		z-index: 9999;
	}

	.nav-button {
		flex: 1;
		height: 80rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #1890ff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		color: white;
		font-size: 30rpx;
		font-weight: 500;
	}

	.back-button {
		background: #666;
	}

	/* 按钮点击反馈 */
	.nav-button:active {
		opacity: 0.8;
		transform: scale(0.98);
	}
</style>