import { useChatStore } from '@/store'

export function useChat() {
  const chatStore = useChatStore()

  const getChatByUuidAndIndex = (uuid: number, index: number) => {
    return chatStore.getChatByUuidAndIndex(uuid, index)
  }

  const addChat = (uuid: number, chat: Chat.Chat) => {
    chatStore.addChatByUuid(uuid, chat)
  }

	const addPMChat = (uuid: number, chat: Chat.PMChat) => {
		chatStore.addPMByUuid(uuid, chat)
	}

  const updateChat = (uuid: number, index: number, chat: Chat.Chat) => {
    chatStore.updateChatByUuid(uuid, index, chat)
  }

	const updatePMChat = (uuid: number, index: number, chat: Chat.PMChat) => {
		chatStore.updatePMChatByUuid(uuid, index, chat)
	}

  const updateChatSome = (uuid: number, index: number, chat: Partial<Chat.Chat>) => {
    chatStore.updateChatSomeByUuid(uuid, index, chat)
  }

  return {
		addPMChat,
		updatePMChat,
    addChat,
    updateChat,
    updateChatSome,
    getChatByUuidAndIndex,
  }
}
