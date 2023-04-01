<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NButton, NCheckbox, NGi, NGrid, NInput, NLayoutSider } from 'naive-ui'
import Footer from './Footer.vue'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { PromptStore } from '@/components/common'

const appStore = useAppStore()
const chatStore = useChatStore()

const prompt = ref<string>('')
const cities = ref(null)

const { isMobile } = useBasicLayout()
const show = ref(false)

const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd() {
  chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })
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
        <div style="height:90%;margin: 30px;border-radius: 20px 20px 0px 0px;background-color: #282c35">
          <div style="margin-top: 50px; text-align: center">
            <span style="font-size: 20px;background-color: #3c3b4d;font-weight:normal">
              &nbsp;&nbsp;&nbsp;&nbsp; P R D 生 成 &nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </div>
          <div style="padding-left: 30px;padding-right: 30px; color: #6b6a7c">
            <div>
              功能
              <NInput
                v-model:value="prompt"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: isMobile ? 4 : 8 }"
              />
            </div>
            <div style="margin-top: 20px">
              需求描述
              <NInput
                v-model:value="prompt"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: isMobile ? 4 : 8 }"
              />
            </div>
            <div style="margin-top: 20px">
              内容包含
              <br>
              <NCheckboxGroup v-model:value="cities">
                <NGrid x-gap="12" :y-gap="8" :cols="2">
                  <NGi>
                    <NCheckbox value="Beijing" label="概述" />
                  </NGi>
                  <NGi>
                    <NCheckbox value="Shanghai" label="目标" />
                  </NGi>
                  <NGi>
                    <NCheckbox value="Guangzhou" label="用户使用旅程" />
                  </NGi>
                  <NGi>
                    <NCheckbox value="Shenzen" label="功能概述" />
                  </NGi>
                  <NGi>
                    <NCheckbox value="Shenzen" label="功能详细描述" />
                  </NGi>
                </NGrid>
              </NCheckboxGroup>

              <NButton style="margin-top: 15px" block strong secondary type="success" @click="handleAdd">
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
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
  <PromptStore v-model:visible="show" />
</template>
