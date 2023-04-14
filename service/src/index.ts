import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import {sendVerifyMail, sign_up} from './login'
import {find_user_by_email} from "./user";
import {sendResponse} from "./utils";

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/send-verify-mail', async (req, res) => {
	try{
		console.log(req.body)
		await sendVerifyMail(req.body.to_email)
	} catch (error) {
		res.send({ status: 'Fail', message: error.message, data: null })
	}
})

router.post('/sign-up', async (req, res) =>{
	try{
		const { to_email, verify_code, password, confirm_password} = req.body
		await sign_up(to_email, verify_code, password, confirm_password)
		res.send({ status: 'Success', message: ''})
	} catch (error) {
		res.send({ status: 'Fail', message: error.message, data: null })
	}
})

router.post('/sign-in', async (req, res)=>{
	try{
		const {email, password} = req.body
		console.log(1111111111)

		const user_data = await find_user_by_email(email, password)
		console.log(user_data)
		if (user_data){
			return res.send({status:'Success', message: ""})
		}
		return res.send({status:'Fail', message: "用户不存在"})
	}catch (error) {
		res.send({ status: 'Fail', message: error.message, data: null })
	}
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3003, () => globalThis.console.log('Server is running on port 3003'))
