<template>
  <div class="verification-code-input">
    <div class="code-inputs">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        v-model="digits[index]"
        :ref="(el) => setInputRef(el, index)"
        maxlength="1"
        class="code-digit"
        @input="handleInput(index, $event.target.value)"
        @keydown="handleKeydown(index, $event)"
        @paste="handlePaste"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  length: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const digits = ref(Array(props.length).fill(''))
const inputRefs = ref([])

const setInputRef = (el, index) => {
  if (el) {
    inputRefs.value[index] = el
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== digits.value.join('')) {
    digits.value = newVal.split('').concat(Array(props.length).fill('')).slice(0, props.length)
  }
}, { immediate: true })

// 监听内部值变化
watch(digits, (newDigits) => {
  const code = newDigits.join('')
  emit('update:modelValue', code)
}, { deep: true })

const handleInput = (index, value) => {
  // 只允许数字
  const numericValue = value.replace(/\D/g, '')
  digits.value[index] = numericValue

  // 自动跳转到下一个输入框
  if (numericValue && index < props.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }
}

const handleKeydown = (index, event) => {
  // 退格键处理
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus()
    })
  }
  // 左右箭头键处理
  else if (event.key === 'ArrowLeft' && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus()
    })
  }
  else if (event.key === 'ArrowRight' && index < props.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').replace(/\D/g, '')
  const pastedDigits = pastedData.split('').slice(0, props.length)

  pastedDigits.forEach((digit, index) => {
    if (index < props.length) {
      digits.value[index] = digit
    }
  })

  // 聚焦到最后一个填充的输入框
  const lastFilledIndex = Math.min(pastedDigits.length - 1, props.length - 1)
  nextTick(() => {
    inputRefs.value[lastFilledIndex]?.focus()
  })
}

// 暴露方法给父组件
defineExpose({
  focus: () => {
    inputRefs.value[0]?.focus()
  },
  clear: () => {
    digits.value = Array(props.length).fill('')
    inputRefs.value[0]?.focus()
  }
})
</script>

<style lang="less" scoped>
.verification-code-input {
  .code-inputs {
    display: flex;
    gap: 8px;
    justify-content: center;

    .code-digit {
      width: 40px;
      height: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      background: var(--el-fill-color-blank);
      color: var(--el-text-color-regular);
      outline: none !important;
      box-shadow: none !important;
      transition: border-color 0.2s ease;

      &:hover {
        border-color: var(--el-border-color-hover);
      }

      &:focus {
        border-color: var(--el-color-primary);
        outline: none !important;
        box-shadow: none !important;
      }

      &:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }

      &:active {
        outline: none !important;
        box-shadow: none !important;
      }

      // 移除浏览器默认的焦点样式
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type=number] {
        -moz-appearance: textfield;
      }
    }
  }
}
</style>
