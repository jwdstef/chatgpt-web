<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { NAutoComplete, NButton, NInput,NModal, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import { useUsingContext } from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useChatStore, usePromptStore } from '@/store'
import {fetchChatAPIProcess, oneApiChat} from '@/api'
import { t } from '@/locales'

let controller = new AbortController()

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()
const maxMessage = 10

const chatStore = useChatStore()

useCopyCode()

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()

const { uuid } = route.params as { uuid: string }

// const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const dataSources = ref<any[]>([])
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)
const visible = ref<boolean>(false)

// 添加PromptStore
const promptStore = usePromptStore()

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

window.postMessage = function (message) {

	window.sendDataToJava({
		request: JSON.stringify({key:'query-server-config'}),
		persistent:false,
		onSuccess: function(responseData) {
			let token = JSON.parse(responseData).token
			if (!token) {
				visible.value  = true
				return
			}

			dataSources.value.push({
				dateTime:new Date().toLocaleString(),
				text: message.dataStr,
				inversion: true,
				error: false,
				conversationOptions: null,
				requestOptions: { prompt: 'message', options: null },
			})
			let lastText = ''
			contextList.push({
				role: "user",
				content: message.data
			})
			if (contextList.length > maxMessage) {
				contextList.splice(0, contextList.length - maxMessage);
			}
			dataSources.value.push({
				dateTime:new Date().toLocaleString(),
				text: '',
				inversion: false,
				error: false,
				conversationOptions: null,
				requestOptions: { prompt: lastText, options: null },
			})
			oneApiChat(contextList,token).then(response => {
				const reader = response.body!.getReader(); // 注意这里使用了非空断言

				function readStream() {
					reader.read().then(({ done, value }) => {
						if (done) {
							console.log('流式输出完成');
							contextList.push({
								role: "system",
								content: lastText
							})
							if (contextList.length > maxMessage) {
								contextList.splice(0, contextList.length - maxMessage);
							}
							lastText = ''
							useCopyCode()
							return;
						}
						const data = new TextDecoder().decode(value);
						const dataList = data.split('data: ')
						for (let index in dataList){
							if(dataList[index] !== '') {
								console.log('dataList[index]',dataList[index])
								try {
									const jsonRegex = /"id":"(.*?)","object":"chat\.completion\.chunk","created":\d+,"model":"[^"]+","choices":\[\{"delta":\{"content":"(.*?)"\},"index":\d+,"finish_reason":null}]/;
									const match = dataList[index].match(jsonRegex);
									if (match) {
										const content = match[2];
										lastText += content.replace(/\\n/g, "\n").replace('\\"', '"');
										console.log('content:', content)
										console.log('content.replace',content.replace(/\\n/g, "\n"))
										console.log(lastText)
										dataSources.value[dataSources.value.length - 1] = {
											dateTime:new Date().toLocaleString(),
											text: lastText,
											inversion: false,
											error: false,
											conversationOptions: null,
											requestOptions: { prompt: lastText, options: null },
										}
										scrollToBottom()

									}

								} catch (error) {
									console.error(error)
									dataSources.value[dataSources.value.length - 1] = {
										dateTime:new Date().toLocaleString(),
										text: '网络异常，请检查网络是否通畅',
										inversion: false,
										error: true,
										conversationOptions: null,
										requestOptions: { prompt: lastText, options: null },
									}
								}
							}
						}

						readStream(); // 继续读取流式数据
					});
				}

				readStream();
			}).catch(error => {
				console.error('请求发生错误1:', error);
				dataSources.value[dataSources.value.length - 1] = {
					dateTime:new Date().toLocaleString(),
					text: '网络异常，请检查网络是否通畅',
					inversion: false,
					error: true,
					conversationOptions: null,
					requestOptions: { prompt: '网络异常，请检查网络是否通畅', options: null },
				}
			});
		},
		onFailure: function(error_code, error_message) {
			alert("失败：[" + error_code + "]" + error_message);
		}
	});

}

function handleSubmit() {
  onConversation()
}


const contextList: { role: string; content: string }[] = []

function onConversation() {
	window.sendDataToJava({
		request: JSON.stringify({key:'query-server-config'}),
		persistent:false,
		onSuccess: function(responseData) {
			let token = JSON.parse(responseData).token
			if (!token) {
				visible.value  = true
				return
			}
			let lastText = ''
			let id = ''
			let ask_prompt = prompt.value
			dataSources.value.push({
				dateTime:new Date().toLocaleString(),
				text: ask_prompt,
				inversion: true,
				error: false,
				conversationOptions: null,
				requestOptions: { prompt: 'message', options: null },
			})

			contextList.push({
				role: "user",
				content: ask_prompt
			})
			if (contextList.length > maxMessage) {
				contextList.splice(0, contextList.length - maxMessage);
			}
			scrollToBottom()

			prompt.value = ''.trim()
			dataSources.value.push({
				dateTime:new Date().toLocaleString(),
				text: '',
				inversion: false,
				error: false,
				conversationOptions: null,
				requestOptions: { prompt: lastText, options: null },
			})
			scrollToBottom()
			oneApiChat(contextList,token).then(response => {
				const reader = response.body!.getReader(); // 注意这里使用了非空断言

				function readStream() {
					reader.read().then(({ done, value }) => {
						if (done) {
							console.log('流式输出完成');
							contextList.push({
								role: "system",
								content: lastText
							})
							if (contextList.length > maxMessage) {
								contextList.splice(0, contextList.length - maxMessage);
							}
							lastText = ''
							useCopyCode()

							return;
						}
						const data = new TextDecoder().decode(value);
						const dataList = data.split('data: ')
						for (let index in dataList){
							if(dataList[index] !== '') {
								console.log('dataList[index]',dataList[index])
								try {
									const jsonRegex = /"id":"(.*?)","object":"chat\.completion\.chunk","created":\d+,"model":"[^"]+","choices":\[\{"delta":\{"content":"(.*?)"\},"index":\d+,"finish_reason":null}]/;
									const match = dataList[index].match(jsonRegex);
									if (match) {
										const content = match[2];
										lastText += content.replace(/\\n/g, "\n").replace('\\"', '"');
										console.log('content:', content)
										console.log('content.replace',content.replace(/\\n/g, "\n"))
										console.log(lastText)
										dataSources.value[dataSources.value.length - 1] = {
											dateTime:new Date().toLocaleString(),
											text: lastText,
											inversion: false,
											error: false,
											conversationOptions: null,
											requestOptions: { prompt: lastText, options: null },
										}
										scrollToBottom()

									}

								} catch (error) {
									console.error(error)
								}
							}
						}

						readStream(); // 继续读取流式数据
					});
				}

				readStream();
			}).catch(error => {
				console.error('请求发生错误:', error);
				dataSources.value[dataSources.value.length - 1] = {
					dateTime:new Date().toLocaleString(),
					text: '网络异常，请检查网络是否通畅',
					inversion: false,
					error: true,
					conversationOptions: null,
					requestOptions: { prompt: '网络异常，请检查网络是否通畅', options: null },
				}
			});
		},
		onFailure: function(error_code, error_message) {
			alert("失败：[" + error_code + "]" + error_message);
		}
	});

}
function onRegenerate(index: number) {
	// scrollToBottom()
	// oneApiChat([
	// 	{
	// 		role: 'user',
	// 		content: '你好，你是谁'
	// 	}
	// ]).then(response => {
	// 	const reader = response.body!.getReader(); // 注意这里使用了非空断言
	//
	// 	function readStream() {
	// 		reader.read().then(({ done, value }) => {
	// 			if (done) {
	// 				console.log('流式输出完成');
	// 				return;
	// 			}
	//
	// 			const data = new TextDecoder().decode(value);
	// 			console.log(data); // 在这里处理流式数据
	//
	// 			readStream(); // 继续读取流式数据
	// 		});
	// 	}
	//
	// 	readStream();
	// }).catch(error => {
	// 	console.error('请求发生错误:', error);
	// });
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(+uuid)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  // if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  // }
  // else {
  //   if (event.key === 'Enter' && event.ctrlKey) {
  //     event.preventDefault()
  //     handleSubmit()
  //   }
  // }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})

onMounted(() => {
  scrollToBottom()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
		<NModal :show="visible" style="width: 90%; max-width: 640px">
		<div class="p-10 bg-white rounded dark:bg-slate-800">
			<div class="space-y-4">
				<header class="space-y-2">
					<h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
						Chinasoft-Xcode
					</h2>
					<p class="text-base text-center text-slate-500 dark:text-slate-500">
						请配置 api key
					</p>
				</header>
				<NButton
					block
					type="primary"
					@click="visible = false"
				>
					确定
				</NButton>
			</div>
		</div>
	</NModal>
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
    />
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <template v-if="!dataSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
              <span>欢迎使用Chinasoft-Xcode</span>
            </div>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources"
                :key="index"
                :date-time="item.dateTime"
                :text="item.text"
                :inversion="item.inversion"
                :error="item.error"
                :loading="item.loading"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index)"
              />
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  Stop Responding
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
<!--          <HoverButton @click="handleClear">-->
<!--            <span class="text-xl text-[#4f555e] dark:text-white">-->
<!--              <SvgIcon icon="ri:delete-bin-line" />-->
<!--            </span>-->
<!--          </HoverButton>-->
<!--          <HoverButton v-if="!isMobile" @click="handleExport">-->
<!--            <span class="text-xl text-[#4f555e] dark:text-white">-->
<!--              <SvgIcon icon="ri:download-2-line" />-->
<!--            </span>-->
<!--          </HoverButton>-->
<!--          <HoverButton v-if="!isMobile" @click="toggleUsingContext">-->
<!--            <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">-->
<!--              <SvgIcon icon="ri:chat-history-line" />-->
<!--            </span>-->
<!--          </HoverButton>-->
          <NAutoComplete v-model:value="prompt" :options="searchOptions" :render-label="renderOption">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                ref="inputRef"
                v-model:value="prompt"
                type="textarea"
                :placeholder="placeholder"
                :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>
