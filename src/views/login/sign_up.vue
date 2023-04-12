<template>
	<div>
		<n-form ref="form" :model="form" :rules="rules">
			<n-form-item label="邮箱" prop="email">
				<n-input v-model="form.email"></n-input>
			</n-form-item>
			<n-form-item label="验证码" prop="code">
				<n-input v-model="form.code"></n-input>
				<n-button @click="sendCode" :disabled="count !== 60">{{ count === 60 ? '发送验证码' : `${count}秒后重新发送` }}</n-button>
			</n-form-item>
			<n-form-item label="密码" prop="password">
				<n-input v-model="form.password" type="password"></n-input>
			</n-form-item>
			<n-form-item label="确认密码" prop="confirm">
				<n-input v-model="form.confirm" type="password"></n-input>
			</n-form-item>
			<n-form-item>
				<n-button type="primary" @click="submitForm">提交</n-button>
			</n-form-item>
		</n-form>
	</div>

</template>
<script>
import {defineComponent, ref} from "vue";
import { NForm, NFormItem, NInput, NButton, NMessage } from 'naive-ui';
import {sendVerifyMail} from "../../api";


export default defineComponent({
	setup() {

		const validateEmail = (_, value) => {
			if (!value) {
				return Promise.reject(new Error('请输入邮箱'));
			}

			// 省略邮箱格式校验逻辑
			// ...

			return Promise.resolve();
		};

		const validateConfirm = (_, value) => {
			if (!value) {
				return Promise.reject(new Error('请再次输入密码'));
			}

			if (value !== password.value) {
				return Promise.reject(new Error('两次输入的密码不一致'));
			}

			return Promise.resolve();
		};

		const rules = {
			email: [{ required: true, validator: validateEmail }],
			code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
			password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
			confirm: [{ required: true, validator: validateConfirm, trigger: 'blur' }],
		};

		const form = {
			email: '',
			code: '',
			password: '',
			confirm: ''
		}

		const count = 0


		return {
			rules,
			form,
			count
		};
	},
	methods: {
		sendCode() {
			// 发送验证码逻辑
			// 省略具体实现
			sendVerifyMail()

			this.timer = setInterval(() => {
				if (this.count > 0) {
					this.count--;
				} else {
					clearInterval(this.timer);
					this.count = 60;
				}
			}, 1000);
		},
		submitForm() {
			this.$refs.form.validate((valid) => {
				if (valid) {
					// 提交表单逻辑
					// 省略具体实现

					NMessage.success('注册成功');
				}
			});
		},
	}
});
</script>


<style scoped>

</style>
