<template>
  <div>
    <el-card class="box-card">
      <h2 class="title">修改密码</h2>
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" :show-password="true"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码"
            :show-password="true"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
  
<script>
import request from "@/utils/request.js"
export default {
  data() {
    return {
      user: {},
      form: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      admin: {
        username: "",
        password: ""
      },
      token: "",
      rules: {
        oldPassword: [
          { required: true, message: "请输入旧密码", trigger: "blur" },
        ],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "新密码长度不能少于6位", trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          {
            validator: this.validateConfirmPassword,
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    validateConfirmPassword(rule, value, callback) {
      if (value === this.form.newPassword) {
        callback();
      } else {
        callback(new Error("两次输入的新密码不一致"));
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const userData = JSON.parse(localStorage.getItem("user0"));
          this.user = userData;
          console.log(this.form.oldPassword)
          if (this.form.oldPassword === this.user.password) {
            this.admin.username = this.user.username;
            this.admin.password = this.form.newPassword;
            console.log(this.admin);
            this.token = this.user.token;

            request.post('/admin/password', this.admin, {
              headers: { Authorization: `Bearer ${this.token}` }
            }).then(res => {
              if (res.code === 200) {
                this.$message.success('修改成功');
                this.$refs.form.resetFields();
                // 构造包含修改后密码的新用户信息对象
                const updatedUserData = { ...this.user, password: this.form.newPassword };
                // 将更新后的用户信息重新存储到localStorage中，覆盖原来的user0数据
                localStorage.setItem("user0", JSON.stringify(updatedUserData));
                const userData = JSON.parse(localStorage.getItem("user0"));
                this.user = userData;
              }
            })
          } else {
            this.$message.error('旧密码不正确')
          }

        }
      });
    },
    resetForm() {
      this.$refs.form.resetFields();
    },
  },
};
</script>
  
<style scoped>
.box-card {
  width: 60%;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}
</style>