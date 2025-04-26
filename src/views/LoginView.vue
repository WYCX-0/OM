<template>
  <div class="login-container">
      <div class="login-box">
          <div class="logo">
              <h1>运维</h1>
          </div>
          <el-form :model="user" ref="loginForm" :rules="rules" label-width="0px" class="form-container">
              <el-form-item prop="username">
                  <el-input prefix-icon="el-icon-user" size="large" placeholder="请输入账号" v-model="user.username"
                            clearable></el-input>
              </el-form-item>
              <el-form-item prop="password">
                  <el-input prefix-icon="el-icon-lock" size="large" placeholder="请输入密码" v-model="user.password"
                            show-password clearable></el-input>
              </el-form-item>
              <el-form-item class="button-group">
                  <el-button type="primary" size="large" style="width: 100%; margin-bottom: 10px;" @click="login">登录</el-button>
              </el-form-item>
          </el-form>
      </div>
  </div>
</template>

<script>
import request from "@/utils/request.js";
import WebSocketService from "@/utils/websocket.js";
import Vue from 'vue';

export default {
  name: "LoginView",
  data() {
    return {
      user: {
        username: '',
        password: '',
      },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          request.post('/admin/login', this.user).then(res => {
            if (res.code === 200) {
              localStorage.setItem("user0", JSON.stringify(res.data));
              this.$message.success('登录成功');

              // 获取 token
              const token = res.data.token; // 假设 token 在 res.data.token 中

              // 创建 WebSocket 实例并连接，传递 $globalDialog 实例
              const socketUrl = `ws://192.168.72.195:9090/ws/admin/${res.data.id}`; // 替换为实际的 WebSocket 地址
              const webSocketService = new WebSocketService(socketUrl, token);
              webSocketService.connect();

              Vue.prototype.$webSocket=webSocketService;

              this.$router.push('/index');
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f7f9;
}

.login-box {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-width: 80%;
  padding: 30px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
  color: #007bff;
}

.form-container .el-input {
  border: 1px solid #e4e7ea;
  margin-bottom: 20px;
}

.form-container .el-input:focus {
  border-color: #007bff;
}

.button-group {
  display: flex;
  flex-direction: column;
}

.el-button[type="primary"] {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.el-button[type="text"] {
  color: #007bff;
  text-decoration: none;
  padding: 0;
}

.el-button[type="text"]:hover {
  text-decoration: underline;
}
</style>    