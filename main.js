import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import WebSocketManager from './common/websocket.js'; // 确保路径正确，文件名大小写也需匹配

// 将 WebSocketManager 实例挂载到 Vue 原型上
Vue.prototype.$websocket = new WebSocketManager();

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'

export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif    