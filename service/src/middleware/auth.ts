import { isNotEmptyString } from '../utils/is'

const auth = async (req, res, next) => {
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      const Authorization = req.header('Authorization')
      if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim())
        throw new Error('Error: 无访问权限 | No access rights')
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}


import { Request, Response, NextFunction } from 'express';
import {redisGet} from "../utils/redis_tool";

function checkToken(req: Request, res: Response, next: NextFunction) {
	const accessToken = req.headers['access_token'];
	const email = req.headers['email'];

	if (req.path === '/sign-in') {
		next()
		return
	} else {
		// 如果access-token存在，则将其添加到请求对象中以供后续使用
		if (accessToken && email) {
			redisGet('token:' + email).then(token_data=>{
				if (accessToken === token_data) {
					next()
					console.log(123213123)
					return
				} else {
					return res.send({ status: 'NoLogin', message: '', data: null })
				}
			}).catch(error=>{
				console.log(33333)
				return res.send({ status: 'NoLogin', message: error, data: null })
			})
		}else {
			return res.send({ status: 'NoLogin', message: '', data: null })
		}
	}
}

export { auth, checkToken }
