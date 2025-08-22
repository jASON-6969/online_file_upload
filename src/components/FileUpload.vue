<template>
  <div class="w-full max-w-2xl mx-auto">
    <div
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
      :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
    >
      <div class="space-y-4">
        <div class="text-6xl text-gray-400">📁</div>
        <div class="text-xl font-medium text-gray-700">
          {{ isDragOver ? '釋放檔案以上傳' : '拖拽檔案到這裡或點擊上傳' }}
        </div>
        <div class="text-sm text-gray-500">
          支援所有檔案類型，最大100MB
        </div>
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          class="hidden"
          multiple
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          選擇檔案
        </button>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="mt-6">
      <div class="bg-gray-100 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">上傳中...</span>
          <span class="text-sm text-gray-500">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 上传结果 -->
    <div v-if="uploadResult" class="mt-4">
      <div
        v-if="uploadResult.success"
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
      >
        檔案上傳成功！
      </div>
      <div
        v-else
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
      >
        上傳失敗：{{ uploadResult.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadFile } from '../lib/supabase'

const emit = defineEmits(['file-uploaded'])

const fileInput = ref(null)
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    handleFiles(files)
  }
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    handleFiles(files)
  }
}

const handleFiles = async (files) => {
  for (const file of files) {
    if (file.size > 100 * 1024 * 1024) { // 100MB限制
      alert(`檔案 ${file.name} 超過100MB限制`)
      continue
    }
    
    await uploadSingleFile(file)
  }
}

const uploadSingleFile = async (file) => {
  uploading.value = true
  uploadProgress.value = 0
  uploadResult.value = null
  
        // 生成唯一檔案名
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  
  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 20
      }
    }, 200)
    
    const result = await uploadFile(file, fileName)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    uploadResult.value = result
    
    if (result.success) {
      emit('file-uploaded', {
        name: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: result.url
      })
      
      // 重置檔案輸入
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
    
    // 3秒后隐藏结果
    setTimeout(() => {
      uploadResult.value = null
      uploading.value = false
      uploadProgress.value = 0
    }, 3000)
    
  } catch (error) {
    uploadResult.value = { success: false, error: error.message }
    uploading.value = false
    uploadProgress.value = 0
  }
}
</script>
