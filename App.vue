<script>
	import {
		websocketObj
	} from './utils/websocket'

	export default {
		onLaunch() {
			// 设置全局 WebSocket 消息处理器
			websocketObj.setMessageHandler(this.handleGlobalMessage);
		},

		methods: {
			// 修正方法定义语法
			handleGlobalMessage(data) {
				// 添加安全判断
				if (data && data.message) {
					uni.showModal({
						title: '系统通知',
						content: data.message,
						showCancel: false
					});
				}
			}
		},

		onShow() {
			console.log('App Show')
		},

		onHide() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 每个页面公共css */
</style>