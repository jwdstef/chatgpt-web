import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()

  return post<T>({
    url: '/chat-process',
    data: { prompt: params.prompt, options: params.options, systemMessage: settingStore.systemMessage },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

type ChatItem = {
	role: string;
	content: string;
};
export function oneApiChat<T = any>(chatList: ChatItem[], token:string) {
	return fetch('http://60.204.142.133:2000/v1/chat/completions', {
		method: 'POST',
		headers: {
			// 'Authorization': '38e6e1173bc045c094e6f0454c4b29ec',
			'Authorization': token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: chatList,
			stream: true
		})
	});
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}
