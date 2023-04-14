import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from './helper'
import { store } from '@/store'
import { fetchSession } from '@/api'
import {getAccessToken, removeAccessToken, setAccessToken} from "@/store/modules/auth/access_token";
import {getUserEmail, removeUserEmail, setUserEmail} from "@/store/modules/auth/user";

interface SessionResponse {
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): { access_token: any | null; session: null; email: any | null; token: any | null } => ({
    token: getToken(),
		access_token: getAccessToken(),
		email: getUserEmail(),
    session: null,
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      // @ts-ignore
			return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<SessionResponse>()
        // @ts-ignore
				this.session = { ...data }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

		setAccessToken(token: string) {
			this.access_token = token
			setAccessToken(token)
		},

		setUserEmail(email: string) {
			this.email = email
			setUserEmail(email)
		},

		removeUserEmail() {
			this.email = undefined
			removeUserEmail()
		},

		getUserEmail() {
			return getUserEmail()
		},

		getAccessToken() {
			return getAccessToken()
		},

		removeAccessToken() {
			this.access_token = undefined
			removeAccessToken()
		},

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
