<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">📤</div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">檔案上傳分享</h1>
              <p class="text-sm text-gray-500">手機上傳，電腦查看，隨時隨地分享檔案</p>
            </div>
          </div>
          <div class="hidden sm:block">
            <div class="text-right">
              <div class="text-sm text-gray-500">當前時間</div>
              <div class="text-lg font-medium text-gray-900">{{ currentTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- 文件上传区域 -->
        <section>
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">上傳檔案</h2>
            <p class="text-lg text-gray-600">支援拖拽上傳，最大100MB</p>
          </div>
          <FileUpload @file-uploaded="handleFileUploaded" />
        </section>

        <!-- 文件列表区域 -->
        <section>
          <FileList :refresh-trigger="refreshTrigger" />
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-500">
          <p class="mt-2 text-sm">
            支援手機和電腦訪問，檔案儲存在雲端
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FileUpload from './components/FileUpload.vue'
import FileList from './components/FileList.vue'

const currentTime = ref('')
const refreshTrigger = ref(0)
let timeInterval = null

    // 更新時間
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

    // 處理檔案上傳完成
const handleFileUploaded = () => {
        // 觸發檔案列表刷新
  refreshTrigger.value = Date.now()
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
