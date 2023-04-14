import type { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from 'axios'
import request from './axios'
import { useAuthStore } from '@/store'
import {getAccessToken} from "@/store/modules/auth/access_token";
import {getUserEmail} from "@/store/modules/auth/user";

export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  signal?: GenericAbortSignal
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  data: T
  message: string | null
  status: string
}

function http<T = any>(
  { url, data, method, headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    const authStore = useAuthStore()

    if (res.data.status === 'Success' || res.data.status === 'Fail' || typeof res.data === 'string')
      return res.data

    if (res.data.status === 'Unauthorized') {
      authStore.removeToken()
			window.location.href = '/#login'
    }

		if (res.data.status === 'NoLogin') {
			authStore.removeToken()
			authStore.removeAccessToken()
			authStore.removeUserEmail()
			window.location.href = '/#login'
		}

    return Promise.reject(res.data)
  }

  const failHandler = (error: Response<Error>) => {
    afterRequest?.()
    throw new Error(error?.message || 'Error')
  }

  beforeRequest?.()

  method = method || 'GET'

  const params = Object.assign(typeof data === 'function' ? data() : data ?? {}, {})

  return method === 'GET'
    ? request.get(url, { params, signal, onDownloadProgress }).then(successHandler, failHandler)
    : request.post(url, params, { headers, signal, onDownloadProgress }).then(successHandler, failHandler)
}

export function get<T = any>(
  { url, data, method = 'GET', headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
	const accessToken = getAccessToken(); // 获取access token
	headers = { ...headers, access_token: accessToken, email:getUserEmail() }; // 将access token添加到请求头中
  return http<T>({
    url,
    method,
    data,
		headers,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export function post<T = any>(
  { url, data, method = 'POST', headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
	const accessToken = getAccessToken(); // 获取access token
	headers = { ...headers, access_token: accessToken , email:getUserEmail()}; // 将access token添加到请求头中
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export default post
