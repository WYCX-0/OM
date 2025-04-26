<template>
  <div id="app">
    <router-view/>
    <GlobalDialog ref="globalDialog" />
  </div>
</template>

<script>
import GlobalDialog from './components/GlobalDialog.vue';

export default {
  name: 'App',
  components: {
    GlobalDialog
  },
  mounted() {
    // 监听全局WebSocket消息事件
    window.addEventListener('websocket-message', this.handleWebSocketMessage);
  },
  beforeDestroy() {
    window.removeEventListener('websocket-message', this.handleWebSocketMessage);
  },
  methods: {
    handleWebSocketMessage(event) {
      const message = event.detail;
      this.$refs.globalDialog.showDialog(`收到消息: ${message}`);
    }
  }
};
</script>
    