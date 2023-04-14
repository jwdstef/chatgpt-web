<script lang="ts" setup>
import { NButton, NForm, NFormItem, NInput, NCard, NTabs, NTabPane, NFormItemRow } from 'naive-ui'
import { useRouter } from 'vue-router'
import {ref} from "vue";
import {sendVerifyMail, user_sign_up} from "@/api";

const router = useRouter()
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


function sendCode() {
	sendVerifyMail(sign_up_form.value.to_email)
}

function sign_up_user() {
	user_sign_up(sign_up_form.value)
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
					pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
				>
					<NTabPane name="signin" tab="登录">
						<NForm ref="form" :model="sign_in_form" :rules="sign_up_rules">
							<NFormItemRow label="邮箱" prop="to_email">
								<NInput v-model:value="sign_in_form.email" />
							</NFormItemRow>
							<NFormItemRow label="密码">
								<NInput v-model:value="sign_in_form.password" />
							</NFormItemRow>
						</NForm>
						<NButton type="primary" block secondary strong>
							登录
						</NButton>
					</NTabPane>
					<n-tab-pane name="signup" tab="注册">
						<n-form :model="sign_up_form" :rules="sign_up_rules">

							<n-form-item-row label="邮箱">
								<n-input v-model:value="sign_up_form.to_email" />
								<n-button @click="sendCode" >{{ count > 180 ? '发送验证码' : `${count}秒后重新发送` }}</n-button>
							</n-form-item-row>
							<n-form-item-row label="邮箱验证码">
								<n-input v-model:value="sign_up_form.verify_code" />
							</n-form-item-row>
							<n-form-item-row label="密码">
								<n-input v-model:value="sign_up_form.password" />
							</n-form-item-row>
							<n-form-item-row label="重复密码">
								<n-input v-model:value="sign_up_form.confirm_password" />
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
