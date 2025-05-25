<template>
	<view class="container">
		<view class="card">
			<view class="title">修改密码</view>
			<form @submit="submitForm" @reset="resetForm">
				<view class="form-item">
					<view class="label">旧密码</view>
					<view class="input-wrapper">
						<input v-model="form.oldPassword" type="password" placeholder="请输入旧密码"
							@blur="validateField('oldPassword')" />
						<view class="error-message" v-if="errors.oldPassword">{{ errors.oldPassword }}</view>
					</view>
				</view>

				<view class="form-item">
					<view class="label">新密码</view>
					<view class="input-wrapper">
						<view class="password-input">
							<input v-model="form.newPassword" :type="showNewPassword ? 'text' : 'password'"
								placeholder="请输入新密码" @blur="validateField('newPassword')" />
							<text class="iconfont" @click="toggleShowPassword('newPassword')">
								{{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
							</text>
						</view>
						<view class="error-message" v-if="errors.newPassword">{{ errors.newPassword }}</view>
					</view>
				</view>

				<view class="form-item">
					<view class="label">确认新密码</view>
					<view class="input-wrapper">
						<view class="password-input">
							<input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
								placeholder="请再次输入新密码" @blur="validateField('confirmPassword')" />
							<text class="iconfont" @click="toggleShowPassword('confirmPassword')">
								{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
							</text>
						</view>
						<view class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</view>
					</view>
				</view>

				<view class="button-group">
					<button type="primary" form-type="submit">提交</button>
					<button type="default" form-type="reset">重置</button>
				</view>
			</form>
		</view>
	</view>
</template>

<script>
	import {
		baseConfig
	} from '../../utils/config';

	export default {
		data() {
			return {
				user: {},
				form: {
					oldPassword: "",
					newPassword: "",
					confirmPassword: ""
				},
				engineer: {
					id: "",
					password: ""
				},
				pass: "",
				token: "",
				rules: {
					oldPassword: [{
						required: true,
						message: "请输入旧密码"
					}],
					newPassword: [{
							required: true,
							message: "请输入新密码"
						},
						{
							min: 6,
							message: "新密码长度不能少于6位"
						}
					],
					confirmPassword: [{
							required: true,
							message: "请再次输入新密码"
						},
						{
							validator: 'validateConfirmPassword',
							message: "两次输入的新密码不一致"
						}
					]
				},
				errors: {
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				showNewPassword: false,
				showConfirmPassword: false
			}
		},
		methods: {
			getAccessToken() {
				this.token = uni.getStorageSync('token');
				this.engineer.id = uni.getStorageSync('id');
				this.pass = uni.getStorageSync('password');
				console.log('用户ID:', this.id);
			},
			validateField(field) {
				const value = this.form[field];
				const rules = this.rules[field] || [];
				let error = '';

				for (const rule of rules) {
					if (rule.required && !value.trim()) {
						error = rule.message;
						break;
					}

					if (rule.min && value.length < rule.min) {
						error = rule.message;
						break;
					}

					if (rule.validator === 'validateConfirmPassword') {
						if (value !== this.form.newPassword) {
							error = rule.message;
							break;
						}
					}
				}

				this.errors[field] = error;
				return !error;
			},

			validateAllFields() {
				let isValid = true;
				['oldPassword', 'newPassword', 'confirmPassword'].forEach(field => {
					if (!this.validateField(field)) {
						isValid = false;
					}
				});
				return isValid;
			},

			toggleShowPassword(type) {
				if (type === 'newPassword') {
					this.showNewPassword = !this.showNewPassword;
				} else {
					this.showConfirmPassword = !this.showConfirmPassword;
				}
			},

			submitForm() {
				if (this.validateAllFields()) {

					if (this.form.oldPassword === this.pass) {
						this.engineer.password = this.form.newPassword;

						uni.request({
							url: `${baseConfig.baseUrl}/engineer/password`,
							method: 'POST', // 修正为大写POST
							header: {
								'Authorization': `Bearer ${this.token}`
							},
							data: this.engineer, // 添加data参数
							success: (res) => {
								if (res.data.code === 200) {
									uni.showToast({
										title: '修改成功',
										icon: 'success'
									});

									this.resetForm();

									// 更新完整的用户信息对象
									const updatedUserData = {
										pass: this.form.newPassword
									};

									// 延迟后返回上一页
									setTimeout(() => {
										uni.navigateBack();
									}, 1500);
								} else {
									uni.showToast({
										title: res.data.message || '修改失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								console.error('修改密码请求失败:', err);
								uni.showToast({
									title: '网络错误，请稍后重试',
									icon: 'none'
								});
							}
						});
					} else {
						uni.showToast({
							title: '旧密码不正确',
							icon: 'none'
						});
					}
				}
			},

			resetForm() {
				this.form = {
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				};
				this.errors = {
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				};
			}
		},
		onLoad() {
			this.getAccessToken();
		}
	}
</script>

<style scoped>
	.container {
		padding: 20px;
	}

	.card {
		background-color: #fff;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	}

	.title {
		text-align: center;
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 20px;
	}

	.form-item {
		margin-bottom: 15px;
	}

	.label {
		color: #606266;
		font-size: 14px;
		margin-bottom: 5px;
	}

	.input-wrapper {
		position: relative;
	}

	input {
		width: 100%;
		height: 40px;
		padding: 0 10px;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		font-size: 14px;
		box-sizing: border-box;
	}

	.password-input {
		position: relative;
	}

	.password-input .iconfont {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		color: #909399;
		cursor: pointer;
	}

	.error-message {
		color: #f56c6c;
		font-size: 12px;
		margin-top: 5px;
	}

	.button-group {
		display: flex;
		justify-content: flex-end;
		margin-top: 20px;
	}

	button {
		width: 100px;
		height: 40px;
		margin-left: 10px;
		border-radius: 4px;
		font-size: 14px;
	}

	button[type="primary"] {
		background-color: #409eff;
		color: #fff;
		border: none;
	}

	button[type="default"] {
		background-color: #fff;
		color: #606266;
		border: 1px solid #dcdfe6;
	}
</style>