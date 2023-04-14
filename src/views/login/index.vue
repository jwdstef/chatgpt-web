<script lang="ts" setup>
import {NButton, NForm, NFormItem, NInput, NCard, NTabs, NTabPane, NFormItemRow, useMessage} from 'naive-ui'
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
const sign_up_form = ref({
	to_email:'',
	verify_code: '',
	password: '',
	confirm_password: ''
})
let sign_in_loading = ref(false)

const sign_up_rules = ref({
	to_email:function validateEmail(rule: any, value: string, callback: (arg0: any | undefined) => void) {
	const reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@[a-z0-9]+([.\\-][a-z0-9]+)*\.[a-z]{2,}$/
	if (!value) {
		callback(new Error('请输入邮箱'))
	} else if (!reg.test(value)) {
		callback(new Error('请输入有效的邮箱地址'))
	} else {
		callback(true)
	}
},
	password:function validatePassword(rule: any, value: string | any[], callback: (arg0: any | undefined) => void) {
		if (!value) {
			callback(new Error('请输入密码'))
		} else if (value.length < 6) {
			callback(new Error('密码长度不能小于6位'))
		} else {
			callback(true)
		}
	}
})
const count = ref(181)
let login_tab = ref<string>('signin')


function sendCode() {
	sendVerifyMail<any>(sign_up_form.value.to_email)
		.then(data=>{
		console.log(data)
		if (data.status === 'Fail') {
			ms.error(data.message ?? 'error')
		}
	}).catch(error => {
		console.error(error);
	});
}

function sign_up_user() {
	user_sign_up<any>(sign_up_form.value).then(data=>{
		if (data.status === 'Success') {
			sign_in_form.value.email = sign_up_form.value.to_email
			sign_in_form.value.password = sign_up_form.value.password
			login_tab.value = 'signin'
		}else{
			ms.error(data.message ?? 'error')
		}
	})
}

async function sign_in_user() {
	user_sign_in<any>(sign_in_form.value)
		.then(data => {
			if(data.status === 'Success') {
				sign_in_loading.value = true
				authStore.setAccessToken(data.message ?? '')
				authStore.setUserEmail(sign_in_form.value.email)
				router.push({name:'Chat'})
			} else {
				ms.error(data.message ?? 'error')
			}
		})
		.catch(error => {
			console.error(error);
		});

}

</script>

<template>
	<div class="flex h-full">
		<div style="width: 500px;margin-top: 10%" class="px-4 m-auto space-y-4 text-center max-[400px]">
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
						<NForm ref="form" :model="sign_in_form" :rules="sign_up_rules">
							<NFormItemRow label="邮箱" prop="to_email">
								<NInput v-model:value="sign_in_form.email" />
							</NFormItemRow>
							<NFormItemRow label="密码">
								<NInput type="password" v-model:value="sign_in_form.password" />
							</NFormItemRow>
						</NForm>
						<NButton :loading="sign_in_loading" @click="sign_in_user" type="primary" block secondary strong>
							登录
						</NButton>
					</NTabPane>
					<n-tab-pane name="signup" key="signup" tab="注册">
						<n-form :model="sign_up_form" :rules="sign_up_rules">

							<n-form-item-row label="邮箱" prop="to_email">
								<n-input v-model:value="sign_up_form.to_email" />
								<n-button @click="sendCode" >{{ count > 180 ? '发送验证码' : `${count}秒后重新发送` }}</n-button>
							</n-form-item-row>
							<n-form-item-row label="邮箱验证码">
								<n-input v-model:value="sign_up_form.verify_code" />
							</n-form-item-row>
							<n-form-item-row label="密码">
								<n-input type="password" v-model:value="sign_up_form.password" />
							</n-form-item-row>
							<n-form-item-row label="重复密码">
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
