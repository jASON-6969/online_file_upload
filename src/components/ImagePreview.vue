<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" @click="closePreview">
    <div class="relative max-w-4xl max-h-full p-4">
      <!-- 关闭按钮 -->
      <button
        @click="closePreview"
        class="absolute top-2 right-2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <!-- 图片容器 -->
      <div class="relative" @click.stop>
        <img
          :src="imageUrl"
          :alt="imageName"
          class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          @load="imageLoaded = true"
          @error="imageError = true"
        />
        
        <!-- 加载状态 -->
        <div v-if="!imageLoaded && !imageError" class="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
        
        <!-- 错误状态 -->
        <div v-if="imageError" class="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
          <div class="text-white text-center">
            <div class="text-4xl mb-2">❌</div>
            <p>圖片載入失敗</p>
          </div>
        </div>
      </div>
      
      <!-- 图片信息 -->
      <div v-if="imageLoaded" class="mt-4 text-center text-white">
        <h3 class="text-lg font-medium">{{ imageName }}</h3>
        <p class="text-sm text-gray-300">{{ imageSize }}</p>
      </div>
      
      <!-- 导航按钮 -->
      <div v-if="hasMultipleImages" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
        <button
          @click.stop="previousImage"
          class="pointer-events-auto p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors ml-4"
          :disabled="currentIndex === 0"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          @click.stop="nextImage"
          class="pointer-events-auto p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors mr-4"
          :disabled="currentIndex === images.length - 1"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <!-- 图片计数器 -->
      <div v-if="hasMultipleImages" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imageName: {
    type: String,
    default: ''
  },
  imageSize: {
    type: String,
    default: ''
  },
  images: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'navigate'])

const imageLoaded = ref(false)
const imageError = ref(false)

const hasMultipleImages = computed(() => props.images.length > 1)

// 监听图片URL变化，重置状态
watch(() => props.imageUrl, () => {
  imageLoaded.value = false
  imageError.value = false
})

const closePreview = () => {
  emit('close')
}

const nextImage = () => {
  if (props.currentIndex < props.images.length - 1) {
    emit('navigate', props.currentIndex + 1)
  }
}

const previousImage = () => {
  if (props.currentIndex > 0) {
    emit('navigate', props.currentIndex - 1)
  }
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (!props.isVisible) return
  
  switch (event.key) {
    case 'Escape':
      closePreview()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'ArrowLeft':
      previousImage()
      break
  }
}

// 监听键盘事件
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
