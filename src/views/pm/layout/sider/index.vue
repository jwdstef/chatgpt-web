<script setup lang='ts'>
import type {CSSProperties} from 'vue'
import {computed, ref, watch, inject} from 'vue'
import {NButton, NCheckbox, NGi, NGrid, NInput, NLayoutSider} from 'naive-ui'
import Footer from './Footer.vue'
import {useAppStore, useChatStore} from '@/store'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {PromptStore} from '@/components/common'

const appStore = useAppStore()
const chatStore = useChatStore()

const title = ref<string>('')
const prompt = ref<string>('')
const checkedValues = ref({
	概述: false,
	目标: false,
	用户使用流程: false,
	功能概述: false,
	功能详细描述: false,
})
const demandDesc = ref<string>('')

const {isMobile} = useBasicLayout()
const show = ref(false)

const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd() {
	chatStore.addHistory({title: 'New Chat', uuid: Date.now(), isEdit: false})
	if (isMobile.value)
		appStore.setSiderCollapsed(true)
}

function handleUpdateCollapsed() {
	appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
	if (isMobile.value) {
		return {
			position: 'fixed',
			zIndex: 50,
		}
	}
	return {}
})

const mobileSafeArea = computed(() => {
	if (isMobile.value) {
		return {
			paddingBottom: 'env(safe-area-inset-bottom)',
		}
	}
	return {}
})

// mitt 相关
const mitt = inject('mitt');

function emitData() {
	mitt.emit('data', {message: title.value, paramObj: {title: title.value, checkedValues: checkedValues.value, demandDesc: demandDesc.value}});
}

watch(
	isMobile,
	(val) => {
		appStore.setSiderCollapsed(val)
	},
	{
		immediate: true,
		flush: 'post',
	},
)
</script>

<template>
	<NLayoutSider
		:collapsed="collapsed"
		:collapsed-width="0"
		:width="500"
		:show-trigger="isMobile ? false : 'arrow-circle'"
		collapse-mode="transform"
		position="absolute"
		bordered
		:style="getMobileClass"
		@update-collapsed="handleUpdateCollapsed"
	>
		<div class="flex flex-col h-full" :style="mobileSafeArea">
			<main class="flex flex-col flex-1 min-h-0">
				<div style="height:90%;margin: 30px;border-radius: 20px 20px 0px 0px;
				padding-bottom: 20px;
				background-color: #282c35; overflow-y: auto">
					<div style="margin-top: 50px; text-align: center">
            <span style="font-size: 20px;background-color: #3c3b4d;font-weight:normal">
              &nbsp;&nbsp;&nbsp;&nbsp; P R D 生 成 &nbsp;&nbsp;&nbsp;&nbsp;
            </span>
					</div>
					<div style="padding-left: 30px;padding-right: 30px; color: #6b6a7c">
						<div>
							功能
							<NInput
								v-model:value="title"
								type="textarea"
								:autosize="{ minRows: 2, maxRows: isMobile ? 4 : 8 }"
							/>
						</div>
						<div style="margin-top: 20px">
							需求描述
							<NInput
								v-model:value="demandDesc"
								type="textarea"
								:autosize="{ minRows: 4, maxRows: isMobile ? 4 : 8 }"
							/>
						</div>
						<div style="margin-top: 20px">
							内容包含
							<br>
							<NGrid x-gap="12" :y-gap="8" :cols="2">
								<NGi>
									<NCheckbox v-model:checked="checkedValues.概述" value="概述" label="概述"/>
								</NGi>
								<NGi>
									<NCheckbox v-model:checked="checkedValues.目标" value="目标" label="目标"/>
								</NGi>
								<NGi>
									<NCheckbox v-model:checked="checkedValues.用户使用流程" value="用户使用流程" label="用户使用流程"/>
								</NGi>
								<NGi>
									<NCheckbox v-model:checked="checkedValues.功能概述" value="功能概述" label="功能概述"/>
								</NGi>
								<NGi>
									<NCheckbox v-model:checked="checkedValues.功能详细描述" value="功能详细描述" label="功能详细描述"/>
								</NGi>
							</NGrid>

							<NButton style="margin-top: 15px" block strong secondary type="success" @click="emitData">
								提交
							</NButton>
						</div>
					</div>
				</div>
				<!--        <div class="p-4"> -->
				<!--          <NButton dashed block @click="handleAdd"> -->
				<!--            {{ $t('chat.newChatButton') }} -->
				<!--          </NButton> -->
				<!--        </div> -->
				<!--        <div cass="flex-1 min-h-0 pb-4 overflow-hidden"> -->
				<!--          <List /> -->
				<!--        </div> -->
				<!--        <div class="p-4"> -->
				<!--          <NButton block @click="show = true"> -->
				<!--            {{ $t('store.siderButton') }} -->
				<!--          </NButton> -->
				<!--        </div> -->
			</main>
			<Footer/>
		</div>
	</NLayoutSider>
	<template v-if="isMobile">
		<div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed"/>
	</template>
	<PromptStore v-model:visible="show"/>
</template>
