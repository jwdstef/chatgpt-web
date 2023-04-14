import { ss } from '@/utils/storage'

const LOCAL_NAME = 'UserInfo'

export function getUserEmail() {
  return ss.get(LOCAL_NAME)
}

export function setUserEmail(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeUserEmail() {
  return ss.remove(LOCAL_NAME)
}
