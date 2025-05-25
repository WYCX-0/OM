<template>
	<view class="container">
		<view class="container">
			<view class="map-button-container">
				<button class="map-button" @tap="navigateToMapPage">
					查看电子围栏地图
				</button>
			</view>
			<!-- 设备名称 -->
			<view class="detail-card">
				<view class="detail-header">
					<text class="detail-label">设备名称:</text>
				</view>
				<view class="detail-content">
					<text class="detail-value">{{ deviceName }}</text>
				</view>
			</view>

			<view class="detail-card">
				<view class="detail-header">
					<text class="detail-label">创建时间:</text>
				</view>
				<view class="detail-content">
					<text class="detail-value">{{ formatBasicDate(detailData.createTime) }}</text>
				</view>
			</view>

			<!-- 上传图片 (仅当状态为处理中时显示) -->
			<view v-if="detailData.status === 2 && countdown === 0" class="detail-card">
				<view class="detail-header">
					<text class="detail-label">上传维修图片:</text>
				</view>
				<view class="detail-content">
					<view class="upload-container">
						<view v-if="!repairImageUrl" class="upload-area" @click="chooseImage">
							<text class="upload-text">点击上传图片</text>
						</view>
						<view v-else class="repair-image-container" @click="chooseImage">
							<image :src="repairImageUrl" mode="widthFix" class="repair-image"></image>
							<view class="ql-image-overlay">
								<text class="overlay-text">点击更换图片</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 处理按钮 (仅当状态为待处理时显示) -->
			<view v-if="detailData.status === 1" class="action-button-container">
				<button class="action-button" hover-class="action-button-hover" @click="startProcessing">
					开始处理
				</button>
			</view>

			<!-- 正常异常单选框 (仅当状态为处理中时显示) -->
			<view v-if="detailData.status === 2&& countdown === 0" class="action-button-container">
				<radio-group @change="onRadioChange">
					<label>
						<radio value="1" :checked="current === '1'" /> 正常
					</label>
					<label>
						<radio value="0" :checked="current === '0'" /> 异常
					</label>
				</radio-group>
			</view>

			<view v-if="detailData.status === 3" class="action-button-container">
				<view class="detail-header">
					<text class="detail-label">设备状态:</text>
				</view>
				<view class="detail-content">
					<text class="detail-value" v-if="detailData.current === 1">正常</text>
					<text class="detail-value" v-if="detailData.current === 0">异常</text>
				</view>
			</view>

			<!-- 新增倒计时显示 -->
			<view v-if="countdown > 0" class="countdown-container">
				<text class="countdown-text">剩余时间: {{ formatCountdown }}</text>
			</view>

			<!-- 修改后的完成维修按钮 -->
			<view v-if="detailData.status === 2 && countdown === 0" class="action-button-container">
				<button class="action-button" hover-class="action-button-hover" @click="completeRepair">
					完成检测
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		baseConfig
	} from '../../utils/config';

	import speak from "@/utils/tts.js";

	export default {
		data() {
			return {
				detailData: {
					id: '',
					deviceId: '',
					createTime: '',
					status: 0,
					current: ''
				},
				repairImageUrl: '',
				finishUrl: '',
				deviceName: '',
				deviceOptions: [],
				token: '',
				current: '', // 新增变量用于存储单选框的值
				// 新增数据项
				countdown: 0, // 3分钟倒计时（单位：秒）
				timer: null, // 倒计时定时器
				locationInterval: null, // 定位检查定时器
				fenceCenter: null, // 围栏中心坐标 [lng, lat]
				fenceRadius: null, // 围栏半径（米）
				// 新增地图相关数据
				markers: [],
				circles: [],
				userLocation: null,
				mapCtx: null,
			};
		},
		onLoad(options) {
			// 从URL参数中获取数据
			if (options.detailData) {
				try {
					this.getAccessToken();
					this.detailData = JSON.parse(decodeURIComponent(options.detailData));
					this.countdown = this.detailData.time || 3;
					this.getDeviceOptions(); // 获取设备选项
					this.getFenceInfo();
					console.log(this.detailData);
				} catch (e) {
					console.error('解析详情数据失败', e);
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
					});
				}
			}
		},
		onReady() {
			this.mapCtx = uni.createMapContext('mapContainer', this);
		},
		onShow() {
			this.getFenceInfo();
			if (this.detailData.status === 2) {
				this.countdown = this.detailData.time || 3;
				this.getFenceInfo();
				this.startLocationCheck();
			}
		},
		onUnload() {
			// 页面卸载时清理定时器
			if (this.timer) clearInterval(this.timer);
			if (this.locationInterval) clearInterval(this.locationInterval);
		},
		computed: {
			// 正确声明计算属性
			formatCountdown() {
				const minutes = Math.floor(this.countdown / 60);
				const seconds = this.countdown % 60;
				return `${minutes}:${seconds.toString().padStart(2, '0')}`;
			}
		},
		methods: {
			navigateToMapPage() {
				uni.navigateTo({
					url: `/pages/map/map?lng=${this.fenceCenter[0]}&lat=${this.fenceCenter[1]}&radius=${this.fenceRadius}`
				});
			},
			async startProcessing() {
				try {
					const confirmResult = await new Promise((resolve) => {
						uni.showModal({
							title: '确认处理',
							content: '确定要开始处理该设备问题吗？',
							success: (res) => {
								resolve(res);
							}
						});
					});

					if (confirmResult.confirm) {
						// 检查定位权限
						const hasPermission = await this.checkAndroidPermission();
						if (!hasPermission) return;

						// 获取当前位置
						const location = await this.getCurrentLocation();
						const isInside = await this.checkInFence(location);
						if (!isInside) {
							uni.showModal({
								title: '提示',
								content: '您不在电子围栏范围内，请移步',
								showCancel: false
							});
							return;
						}

						const requestResult = await new Promise((resolve, reject) => {
							uni.request({
								url: `${baseConfig.baseUrl}/engineer/testOrder/deal/${this.detailData.id}`,
								method: 'POST',
								header: {
									'Authorization': `Bearer ${this.token}`
								},
								success: (res) => {
									resolve(res);
								},
								fail: (err) => {
									reject(err);
								}
							});
						});

						if (requestResult.data.code === 200) {
							uni.showToast({
								title: '开始处理',
								icon: 'success'
							});
							this.updateStatus(2);

							// 1. 获取围栏信息
							this.getFenceInfo();

							// 4. 启动围栏检测
							this.startLocationCheck();

							speak.speak("操作机械设备前，请检查设备状态，确保安全装置齐全有效");

							this.countdown = this.detailData.time || 3;
						} else if (requestResult.data.code === 0) {
							// 根据后端返回的错误信息显示相应的弹框
							const errorMessage = requestResult.data.msg;
							uni.showModal({
								title: '提示',
								content: errorMessage,
								showCancel: false
							});
						}
					}
				} catch (error) {
					console.error('处理过程中出现错误:', error);
					uni.showToast({
						title: '处理失败',
						icon: 'none'
					});
				}
			},
			// 安卓权限检查
			async checkAndroidPermission() {
				return new Promise((resolve) => {
					if (typeof plus !== 'undefined' && plus.os.name === 'Android') {
						plus.android.requestPermissions(
							['android.permission.ACCESS_FINE_LOCATION'],
							() => {
								uni.getLocation({
									type: 'gcj02',
									success: () => resolve(true),
									fail: () => resolve(false)
								});
							},
							() => resolve(false)
						);
					} else {
						uni.getLocation({
							type: 'gcj02',
							success: () => resolve(true),
							fail: () => {
								uni.showModal({
									title: '需要位置权限',
									content: '请在设置中开启定位服务',
									showCancel: false,
									success: () => resolve(false)
								});
							}
						});
					}
				});
			},
			// 初始化地图覆盖物
			initMapOverlays() {
				if (!this.fenceCenter) return;

				// 围栏中心标记
				const fenceMarker = {
					id: 0,
					latitude: this.fenceCenter[1],
					longitude: this.fenceCenter[0],
					title: '设备位置',
					iconPath: '/static/fence-marker.png',
					width: 30,
					height: 30
				};

				// 围栏范围圆圈
				const fenceCircle = {
					latitude: this.fenceCenter[1],
					longitude: this.fenceCenter[0],
					radius: this.fenceRadius,
					strokeWidth: 2,
					strokeColor: '#FF0000',
					fillColor: '#FF000022'
				};

				// 用户位置标记
				const userMarker = {
					id: 1,
					latitude: this.userLocation?.latitude,
					longitude: this.userLocation?.longitude,
					title: '我的位置',
					iconPath: '/static/user-marker.png',
					width: 20,
					height: 20,
					rotate: 0
				};

				this.markers = [fenceMarker, userMarker].filter(Boolean);
				this.circles = [fenceCircle];
			},
			// 更新用户位置标记
			async updateUserPosition() {
				try {
					const location = await this.getCurrentLocation();
					this.userLocation = location;
					this.initMapOverlays();

					// 自动调整地图视野
					this.mapCtx.includePoints({
						points: [{
								latitude: this.fenceCenter[1],
								longitude: this.fenceCenter[0]
							},
							{
								latitude: location.latitude,
								longitude: location.longitude
							}
						],
						padding: [50, 50, 50, 50]
					});
				} catch (error) {
					console.error('获取位置失败:', error);
				}
			},
			// 定位检查方法
			async checkLocation() {
				try {
					const location = await this.getCurrentLocation();
					const isInside = await this.checkInFence(location);
					if (isInside) {
						if (!this.timer) {
							this.startCountdown();
						}
					} else {
						this.resetCountdown();
					}
					this.updateUserPosition(); // 更新地图显示
				} catch (error) {
					console.error('检查位置时出错:', error);
				}
			},
			// 检查是否在围栏内
			checkInFence(location) {
				if (!this.fenceCenter) return false;

				const [lng1, lat1] = this.fenceCenter;
				const lng2 = location.longitude;
				const lat2 = location.latitude;

				const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
				return distance <= this.fenceRadius;
			},
			// 计算距离（Haversine公式）
			calculateDistance(lat1, lng1, lat2, lng2) {
				const toRad = d => d * Math.PI / 180;
				const R = 6378137; // 地球半径（米）

				const φ1 = toRad(lat1);
				const φ2 = toRad(lat2);
				const Δφ = toRad(lat2 - lat1);
				const Δλ = toRad(lng2 - lng1);

				const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
					Math.cos(φ1) * Math.cos(φ2) *
					Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

				return R * c;
			},
			// 开始倒计时
			startCountdown() {
				if (this.timer) return;
				this.timer = setInterval(() => {
					if (this.countdown > 0) {
						this.countdown--;
					} else {
						clearInterval(this.timer);
						this.timer = null;
					}
				}, 1000);
			},
			// 重置倒计时
			resetCountdown() {
				this.countdown = this.detailData.time || 3;
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
			// 修改后的获取围栏信息方法
			getFenceInfo() {
				uni.request({
					url: `${baseConfig.baseUrl}/engineer/device/get/${this.detailData.deviceId}`,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}`
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.fenceCenter = [res.data.data.centerLng, res.data.data.centerLat];
							this.fenceRadius = res.data.data.radius;
							this.initMapOverlays();
							this.updateUserPosition();
							// 确保地图组件初始化
							this.$nextTick(() => {
								this.mapCtx = uni.createMapContext('mapContainer', this);
							});
						}
					}
				});
			},
			// 安卓地图显示
			showFenceMap() {
				if (!this.fenceCenter || this.fenceCenter.length !== 2) {
					uni.showToast({
						title: '无效的围栏坐标',
						icon: 'none'
					});
					return;
				}

				const [longitude, latitude] = this.fenceCenter;
				if (typeof plus !== 'undefined' && plus.maps) {
					const map = new plus.maps.Map('mapContainer');
					map.center = new plus.maps.LatLng(latitude, longitude);
					map.zoom = 17;

					// 添加标记
					const marker = new plus.maps.Marker(
						new plus.maps.LatLng(latitude, longitude)
					);
					map.addOverlay(marker);
				} else {
					uni.showToast({
						title: '地图组件加载失败',
						icon: 'none'
					});
				}
			},
			// 检查位置
			startLocationCheck() {
				if (this.locationInterval) return;
				this.locationInterval = setInterval(async () => {
					try {
						await this.checkLocation();
					} catch (e) {
						console.error('周期定位检查失败:', e);
					}
				}, 5000);
			},
			// 获取当前位置
			getCurrentLocation() {
				return new Promise((resolve, reject) => {
					uni.getLocation({
						type: 'gcj02',
						success: resolve,
						fail: reject
					});
				});
			},
			// 在组件销毁时清除定时器
			beforeDestroy() {
				if (this.timer) clearInterval(this.timer);
				if (this.locationInterval) clearInterval(this.locationInterval);
			},
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 显示临时图片预览
						this.repairImageUrl = res.tempFilePaths[0];

						// 执行上传
						uni.uploadFile({
							url: `${baseConfig.baseUrl}/upload`,
							filePath: res.tempFilePaths[0], // 注意这里用 filePath 不是 src
							name: 'file', // 必须与后端接收参数名一致
							header: {
								'Authorization': `Bearer ${this.token}`,
								'Content-Type': 'multipart/form-data' // 明确指定内容类型
							},
							success: (uploadRes) => {
								try {
									const data = JSON.parse(uploadRes.data);
									if (data.code === 200) {
										this.finishUrl = data
											.data; // 假设返回结构为 { code:200, data:"url" }
									} else {
										uni.showToast({
											title: '上传失败: ' + data.msg,
											icon: 'none'
										});
									}
								} catch (e) {
									console.error('解析响应失败', e);
									uni.showToast({
										title: '上传结果解析失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								console.error('上传失败', err);
								uni.showToast({
									title: `上传失败: ${err.errMsg}`,
									icon: 'none'
								});
							}
						});
					}
				});
			},
			completeRepair() {
				if (!this.finishUrl) {
					uni.showToast({
						title: '请先上传维修图片',
						icon: 'none'
					});
					return;
				}
				if (!this.current) {
					uni.showToast({
						title: '请选择设备状态',
						icon: 'none'
					});
					return;
				}
				console.log("finish:{}", this.finishUrl);
				uni.showModal({
					title: '确认完成',
					content: '确定已完成维修吗？',
					success: (res) => {
						console.log(this.current);
						if (res.confirm) {
							uni.request({
								url: `${baseConfig.baseUrl}/engineer/testOrder/finish/${this.detailData.id}`,
								method: 'POST',
								header: {
									'Authorization': `Bearer ${this.token}`,
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								// 添加 current 参数到请求数据中
								data: `finishUrl=${encodeURIComponent(this.finishUrl)}&current=${this.current}`,
								success: (response) => {
									if (response.data.code === 200) {
										this.updateStatus(3); // 更新状态为已完成
										uni.showToast({
											title: '维修完成',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: '提交维修信息失败',
											icon: 'none'
										});
									}
								},
								fail: () => {
									uni.showToast({
										title: '提交维修信息失败',
										icon: 'none'
									});
								}
							});
						}
					}
				});
			},
			formatBasicDate(dateArray) {
				if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 6) return '--';

				try {
					// 解构数组并处理月份（月份从0开始）
					const [year, month, day, hours, minutes, seconds] = dateArray;

					// 补零函数
					const padZero = num => String(num).padStart(2, '0');

					// 注意：月份需要减1
					const date = new Date(year, month - 1, day, hours, minutes, seconds);
					if (isNaN(date.getTime())) return '--'; // 校验日期合法性

					// 拼接标准格式
					return `${year}-${padZero(month)}-${padZero(day)} ` +
						`${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
				} catch (e) {
					console.error('日期格式化失败:', e);
					return '--';
				}
			},
			getAccessToken() {
				this.token = uni.getStorageSync('token');
			},
			getDeviceOptions() {
				uni.request({
					url: `${baseConfig.baseUrl}/engineer/device/get`,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}` // 确保正确使用存储的 token
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.deviceOptions = res.data.data.map(device => ({
								id: device.id,
								name: device.name
							}));
							this.updateDeviceName(); // 更新设备名称
						} else {
							uni.showToast({
								title: '获取设备列表失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('获取设备列表失败', err);
						uni.showToast({
							title: '获取设备列表失败，请检查网络连接',
							icon: 'none'
						});
					}
				});
			},
			updateDeviceName() {
				const device = this.deviceOptions.find(item => item.id === this.detailData.deviceId);
				if (device) {
					this.deviceName = device.name;
				} else {
					this.deviceName = '未知设备';
				}
			},
			getStatusClass(status) {
				switch (status) {
					case 0:
						return 'status-cancel';
					case 1:
						return 'status-pending';
					case 2:
						return 'status-processing';
					case 3:
						return 'status-complete';
					default:
						return '';
				}
			},
			getStatusText(status) {
				switch (status) {
					case 0:
						return '已取消';
					case 1:
						return '待处理';
					case 2:
						return '处理中';
					case 3:
						return '已完成';
					default:
						return '未知状态';
				}
			},
			updateStatus(newStatus) {
				this.detailData.status = newStatus;
				console.log('状态已更新为:', this.getStatusText(newStatus));
			},
			onRadioChange(e) {
				this.current = e.detail.value;
			}
		}
	};
</script>

<style scoped>
	.repair-image-container {
		width: 100%;
		height: 100%;
		position: relative;
		cursor: pointer;
	}

	.overlay-text {
		font-size: 12px;
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

	.map-button-container {
		padding: 30rpx;
	}

	.map-button {
		background: #1890ff;
		color: white;
		border-radius: 50rpx;
	}

	/* 增强地图容器样式 */
	.map-container {
		margin: 20rpx;
		height: 350rpx;
		border-radius: 16rpx;
		overflow: hidden;
		position: relative;
	}

	.map-container::after {
		content: '电子围栏区域';
		position: absolute;
		bottom: 10rpx;
		right: 10rpx;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
	}

	.countdown-container {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		margin: 20rpx;
		text-align: center;
	}

	.countdown-text {
		font-size: 32rpx;
		color: #1890ff;
		font-weight: bold;
	}

	/* 全局样式 */
	.container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	/* 页面标题 */
	.page-header {
		margin-bottom: 20rpx;
		padding: 20rpx 0;
	}

	.page-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
	}

	/* 卡片样式 */
	.detail-card {
		background-color: white;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: none;
		border: none;
	}

	.detail-header {
		padding: 20rpx;
	}

	.detail-label {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.detail-content {
		padding: 20rpx;
	}

	.detail-value {
		font-size: 28rpx;
		color: #666;
		word-break: break-all;
	}

	.detail-text {
		line-height: 1.6;
	}

	/* 图片样式 */
	.image-container {
		width: 100%;
		position: relative;
	}

	.detail-image {
		width: 100%;
		border-radius: 8rpx;
		margin: 10rpx 0;
	}

	.placeholder-image {
		width: 100%;
		height: 300rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.placeholder-text {
		color: #999;
		font-size: 24rpx;
	}

	/* 上传区域样式 */
	.upload-container {
		width: 100%;
	}

	.upload-area {
		width: 100%;
		height: 200rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 2rpx dashed #ccc;
		margin-bottom: 20rpx;
	}

	.upload-text {
		color: #999;
		font-size: 24rpx;
	}

	.repair-image-container {
		width: 100%;
	}

	.repair-image {
		width: 100%;
		border-radius: 8rpx;
	}

	/* 状态样式 */
	.status-badge {
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: bold;
		display: inline-block;
		box-shadow: none;
	}

	.status-cancel {
		background-color: #f5f5f5;
		color: #999;
	}

	.status-pending {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.status-processing {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.status-complete {
		background-color: #f6ffed;
		color: #52c41a;
	}

	/* 按钮样式 */
	.action-button-container {
		margin: 40rpx 0;
	}

	.action-button {
		background: linear-gradient(to right, #1890ff, #40a9ff);
		color: white;
		border: none;
		border-radius: 8rpx;
		font-size: 28rpx;
		padding: 16rpx 0;
		width: 100%;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.action-button-hover {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
	}
</style>