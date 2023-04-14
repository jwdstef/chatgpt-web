import { ss } from '@/utils/storage'

const LOCAL_NAME = 'ACCESS_TOKEN'

export function getAccessToken() {
  return ss.get(LOCAL_NAME)
}

export function setAccessToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeAccessToken() {
  return ss.remove(LOCAL_NAME)
}
