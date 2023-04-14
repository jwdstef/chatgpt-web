import {RequestOptions} from "../chatgpt/types";
import {ChatGPTAPI, ChatGPTUnofficialProxyAPI, SendMessageOptions} from "chatgpt";
import {isNotEmptyString} from "../utils/is";
import {sendResponse} from "../utils";
import {ApiModel} from "../types";
import {sendMail} from "../utils/email";
import {redisGet} from "../utils/redis_tool";
import {add_user, find_user_by_email} from "../user";
import {user_schema} from "../schema/user";

const timeoutMs: number = !isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 30 * 1000
let apiModel: ApiModel
let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI
const ErrorCodeMessage: Record<string, string> = {
	401: '[OpenAI] 提供错误的API密钥 | Incorrect API key provided',
	403: '[OpenAI] 服务器拒绝访问，请稍后再试 | Server refused to access, please try again later',
	502: '[OpenAI] 错误的网关 |  Bad Gateway',
	503: '[OpenAI] 服务器繁忙，请稍后再试 | Server is busy, please try again later',
	504: '[OpenAI] 网关超时 | Gateway Time-out',
	500: '[OpenAI] 服务器繁忙，请稍后再试 | Internal Server Error',
}

async function chatReplyProcess(options: RequestOptions) {
	const { message, lastContext, process, systemMessage } = options
	try {
		let options: SendMessageOptions = { timeoutMs }

		if (apiModel === 'ChatGPTAPI') {
			if (isNotEmptyString(systemMessage))
				options.systemMessage = systemMessage
		}

		if (lastContext != null) {
			if (apiModel === 'ChatGPTAPI')
				options.parentMessageId = lastContext.parentMessageId
			else
				options = { ...lastContext }
		}

		const response = await api.sendMessage(message, {
			...options,
			onProgress: (partialResponse) => {
				process?.(partialResponse)
			},
		})

		return sendResponse({ type: 'Success', data: response })
	}
	catch (error: any) {
		const code = error.statusCode
		global.console.log(error)
		if (Reflect.has(ErrorCodeMessage, code))
			return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
		return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
	}
}

async function sendVerifyMail(toEmail) {
	try{
		sendMail(toEmail)
	} catch (error) {
		console.log(error)
	}
}

async function sign_up(email, verify_code, password, confirm_password){

	console.log('执行 redis get emailVerifyCode:' + email)

	await redisGet('emailVerifyCode:' + email).then(redis_code=>{
		console.log(verify_code)
		console.log(redis_code)
		if (String(verify_code) !== String(redis_code)) {
			console.log(verify_code)
			console.log(redis_code)
			return { status: 'Fail', message: "验证码错误"}
		}

		const vail_result = user_schema.validate({
			email: email,
			password: password
		})
		if (vail_result.error){
			return { status: 'Fail', message: "格式验证失败:"+vail_result.error}
		}

		// 这里写入库的逻辑
		add_user(email, password)
		return { status: 'Fail', message: '密码与确认密码不一致'}
	})

}

export { sendVerifyMail, sign_up }
