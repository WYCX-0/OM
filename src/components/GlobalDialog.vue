<template>
  <div class="global-dialog" v-show="isVisible">
    <div class="dialog-content">
      <p>{{ message }}</p>
      <button @click="closeDialog">确定</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlobalDialog',
  data() {
    return {
      isVisible: false,
      message: ''
    };
  },
  methods: {
    showDialog(message) {
      this.message = message;
      this.isVisible = true;
    },
    closeDialog() {
      this.isVisible = false;
    }
  }
};
</script>

<style scoped>
.global-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  min-width: 300px;
}
</style>
    