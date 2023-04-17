<script lang="ts" setup>
import {NButton, NForm, NFormItem, NInput, NCard, NTabs, NTabPane, NFormItemRow, useMessage, FormItemRule, FormInst} from 'naive-ui'
import {ref} from "vue";
import {sendVerifyMail, user_sign_in, user_sign_up} from "@/api";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/store";

const ms = useMessage()
const router = useRouter()
const authStore = useAuthStore()

const token = authStore.getAccessToken()
const user_email = authStore.getUserEmail()

if (token && user_email) {
	router.push({name:'Chat'})
}

const sign_in_form = ref({
	email:'',
	password: '',
})
const sign_in_form_ = ref<FormInst | null>()
const sign_up_form = ref({
	to_email:'',
	verify_code: '',
	password: '',
	confirm_password: ''
})
const sign_up_form_ = ref<FormInst | null>()

let sign_in_loading = ref(false)

const validate_email = (rule: FormItemRule, value: string) => {

	const reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@[a-z0-9]+([.\\-][a-z0-9]+)*\.[a-z]{2,}$/
	return new Promise<void>((resolve, reject) => {
		if (!value) {
			reject(Error('请输入邮箱'))
		} else if (!reg.test(value)) {
			reject(new Error('请输入有效的邮箱地址'))
		} else {
			resolve()
		}
	})
}

const validate_password = (rule: FormItemRule, value: string) => {
	return new Promise<void>((resolve, reject) => {
		if (!value) {
			reject(Error('请输入密码'))
		} else if (value.length < 6) {
			reject(new Error('密码长度不能小于6位'))
		} else {
			resolve()
		}
	})
}

const validate_code = (rule: FormItemRule, value: string) => {
	return new Promise<void>((resolve, reject) => {
		if (!value) {
			reject(Error('请输入验证码'))
		} else if (value.length !== 6) {
			reject(new Error('验证码长度为6位'))
		} else {
			resolve()
		}
	})
}

const sign_up_rules = ref({
	to_email:{
		required: true,
		trigger: 'blur',
		validator:validate_email,
	},
	verify_code:{
		required: true,
		trigger: 'blur',
		validator:validate_code,
	},
	password:{
		required: true,
		trigger: 'blur',
		validator:validate_password
	},
	confirm_password:{
		required: true,
		trigger: 'blur',
		validator:validate_password
	},

})

const sign_in_rules = ref({
	email:{
		required: true,
		trigger: 'blur',
		validator:validate_email,
	},
	password:{
		required: true,
		trigger: 'blur',
		validator:validate_password
	}
})


const count = ref(181)
let login_tab = ref<string>('signin')


function sendCode() {
	sendVerifyMail<any>(sign_up_form.value.to_email)
		.then(data=>{
			ms.success('已发送验证码')
		if (data.status === 'Fail') {
			ms.error(data.message ?? 'error')
		}
	}).catch(error => {
		console.error(error);
	});
}

function sign_up_user() {
	sign_up_form_.value?.validate((errors) => {
		if (!errors) {
			user_sign_up<any>(sign_up_form.value).then(data=>{
				if (data.status === 'Success') {
					ms.success('注册成功')
					sign_in_form.value.email = sign_up_form.value.to_email
					sign_in_form.value.password = sign_up_form.value.password
					login_tab.value = 'signin'
				}else{
					ms.error(data.message ?? 'error')
				}
			})
		}
	})
}

function sign_in_user() {
	sign_in_form_.value?.validate((errors) => {
		if (!errors) {
			user_sign_in<any>(sign_in_form.value)
				.then(data => {
					if (data.status === 'Success') {
						sign_in_loading.value = true
						authStore.setAccessToken(data.message ?? '')
						authStore.setUserEmail(sign_in_form.value.email)
						router.push({name: 'Chat'})
					} else {
						ms.error(data.message ?? 'error')
					}
				})
				.catch(error => {
					console.error(error);
				});
		}
	})
}

</script>

<template>
	<div class="flex h-full">
		<div style="width: 500px;margin-top: 10%" class="px-4 m-auto space-y-4 text-left max-[400px]">
			<NCard>
				<NTabs
					class="card-tabs"
					default-value="signin"
					size="large"
					animated
					style="margin: 0 -4px"
					v-model:value="login_tab"
					pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
				>
					<NTabPane name="signin" key="signin" tab="登录">
						<NForm ref="sign_in_form_" :model="sign_in_form" :rules="sign_in_rules">
							<NFormItemRow label="邮箱" path="email">
								<NInput v-model:value="sign_in_form.email" />
							</NFormItemRow>
							<NFormItemRow label="密码" path="password">
								<NInput type="password" v-model:value="sign_in_form.password" />
							</NFormItemRow>
						</NForm>
						<NButton :loading="sign_in_loading" @click="sign_in_user" type="primary" block secondary strong>
							登录
						</NButton>
					</NTabPane>
					<n-tab-pane name="signup" key="signup" tab="注册">
						<n-form ref="sign_up_form_" :model="sign_up_form" :rules="sign_up_rules">

							<n-form-item-row label="邮箱" path="to_email">
								<n-input v-model:value="sign_up_form.to_email" />
								<n-button @click="sendCode" >{{ count > 180 ? '发送验证码' : `${count}秒后重新发送` }}</n-button>
							</n-form-item-row>
							<n-form-item-row label="邮箱验证码" path="verify_code">
								<n-input v-model:value="sign_up_form.verify_code" />
							</n-form-item-row>
							<n-form-item-row label="密码" path="password">
								<n-input type="password" v-model:value="sign_up_form.password" />
							</n-form-item-row>
							<n-form-item-row label="重复密码" path="confirm_password">
								<n-input type="password" v-model:value="sign_up_form.confirm_password" />
							</n-form-item-row>
						</n-form>
						<n-button @click="sign_up_user" type="primary" block secondary strong>
							注册
						</n-button>
					</n-tab-pane>
				</NTabs>
			</NCard>

		</div>
	</div>
</template>
