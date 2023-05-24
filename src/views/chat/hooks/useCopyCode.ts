import { onMounted, onUpdated } from 'vue'
import { copyText } from '@/utils/format'

export function useCopyCode() {
  function copyCodeBlock() {
    const codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
    codeBlockWrapper.forEach((wrapper) => {
      const copyBtn = wrapper.querySelector('.code-block-header__copy')
      const insertBtn = wrapper.querySelector('.code-block-header__insert')
      const codeBlock = wrapper.querySelector('.code-block-body')
      if (copyBtn && codeBlock) {
        copyBtn.addEventListener('click', () => {
          if (navigator.clipboard?.writeText)
            navigator.clipboard.writeText(codeBlock.textContent ?? '')
          else
            copyText({ text: codeBlock.textContent ?? '', origin: true })
        })

				insertBtn.addEventListener('click', () => {
					window.sendDataToJava({
						request: JSON.stringify({key: 'insert', data: codeBlock.textContent ?? ''}),
						persistent: false
					})
				})
      }
    })
  }

  onMounted(() => copyCodeBlock())

  onUpdated(() => copyCodeBlock())
}
