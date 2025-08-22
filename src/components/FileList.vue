<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- 图片预览组件 -->
    <ImagePreview
      :is-visible="previewVisible"
      :image-url="previewImage.url"
      :image-name="previewImage.name"
      :image-size="previewImage.size"
      :images="imageFiles"
      :current-index="previewIndex"
      @close="closePreview"
      @navigate="navigatePreview"
    />
    
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">已上傳的檔案</h3>
        <p class="text-sm text-gray-500 mt-1">點擊檔案名下載，或刪除不需要的檔案</p>
      </div>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">載入中...</p>
      </div>
      
      <div v-else-if="files.length === 0" class="p-8 text-center text-gray-500">
        <div class="text-4xl mb-2">📂</div>
        <p>還沒有上傳任何檔案</p>
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="file in files"
          :key="file.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 flex-1 min-w-0">
              <!-- 文件图标 -->
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 text-lg">
                    {{ getFileIcon(file.type) }}
                  </span>
                </div>
              </div>
              
                             <!-- 文件信息 -->
               <div class="flex-1 min-w-0">
                 <div class="flex items-center space-x-2">
                   <button
                     @click="handleFileClick(file)"
                     class="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                     :title="file.name"
                   >
                     {{ getDisplayName(file.name) }}
                   </button>
                   <span v-if="file.size" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                     {{ formatFileSize(file.size) }}
                   </span>
                   <!-- 图片预览按钮 -->
                   <button
                     v-if="isImageFile(file.type)"
                     @click="openImagePreview(file)"
                     class="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                     title="預覽圖片"
                   >
                     👁️ 預覽
                   </button>
                 </div>
                 <div class="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                   <span>{{ formatFileType(file.type) }}</span>
                   <span>{{ formatDate(file.created_at) }}</span>
                 </div>
               </div>
            </div>
            
                         <!-- 操作按钮 -->
             <div class="flex items-center space-x-2">
               <button
                 @click="downloadFile(file)"
                 :disabled="downloadingFiles.has(file.id)"
                 class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {{ downloadingFiles.has(file.id) ? '下載中...' : '下載' }}
               </button>
               <button
                 @click="deleteFile(file)"
                 class="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
               >
                 刪除
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getFiles, deleteFile as deleteFileFromSupabase } from '../lib/supabase'
import ImagePreview from './ImagePreview.vue'

const props = defineProps({
  refreshTrigger: {
    type: Number,
    default: 0
  }
})

const files = ref([])
const loading = ref(false)

// 图片预览相关状态
const previewVisible = ref(false)
const previewIndex = ref(0)
const previewImage = ref({
  url: '',
  name: '',
  size: ''
})

// 下载状态管理
const downloadingFiles = ref(new Set())

// 计算图片文件列表
const imageFiles = computed(() => {
  return files.value.filter(file => isImageFile(file.type))
})

  // 獲取檔案列表
const fetchFiles = async () => {
  loading.value = true
  try {
    const result = await getFiles()
    if (result.success) {
      files.value = result.data || []
    } else {
      console.error('獲取檔案列表失敗:', result.error)
    }
  } catch (error) {
          console.error('獲取檔案列表錯誤:', error)
  } finally {
    loading.value = false
  }
}

  // 刪除檔案
const deleteFile = async (file) => {
      if (!confirm(`確定要刪除檔案 "${getDisplayName(file.name)}" 嗎？`)) {
    return
  }
  
  try {
    const result = await deleteFileFromSupabase(file.name)
    if (result.success) {
      // 从列表中移除
      files.value = files.value.filter(f => f.id !== file.id)
    } else {
      alert('刪除失敗：' + result.error)
    }
  } catch (error) {
          alert('刪除失敗：' + error.message)
  }
}

    // 下載檔案
  const downloadFile = async (file) => {
    if (!file.url || downloadingFiles.value.has(file.id)) return
    
    // 设置下载状态
    downloadingFiles.value.add(file.id)
    
    try {
      // 方法1: 使用 fetch 下载文件 (推荐)
      const response = await fetch(file.url)
      if (!response.ok) throw new Error('下載失敗')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = url
      link.download = getDisplayName(file.name)
      link.style.display = 'none'
      
      // 添加到页面并触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('下載錯誤:', error)
      
      try {
        // 方法2: 使用 iframe 强制下载
        forceDownload(file.url, getDisplayName(file.name))
      } catch (iframeError) {
        console.error('iframe 下載失敗:', iframeError)
        
        // 方法3: 最后的备用方案 - 直接打开链接
        const link = document.createElement('a')
        link.href = file.url
        link.download = getDisplayName(file.name)
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        
        // 添加特殊属性强制下载
        link.setAttribute('download', getDisplayName(file.name))
        link.setAttribute('type', 'application/octet-stream')
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } finally {
      // 清除下载状态
      downloadingFiles.value.delete(file.id)
    }
  }

  // 处理文件点击
  const handleFileClick = (file) => {
    if (isImageFile(file.type)) {
      openImagePreview(file)
    } else {
      downloadFile(file)
    }
  }

  // 检查是否为图片文件
  const isImageFile = (type) => {
    return type && type.startsWith('image/')
  }

  // 预览图片
  const openImagePreview = (file) => {
    const imageIndex = imageFiles.value.findIndex(img => img.id === file.id)
    if (imageIndex !== -1) {
      previewIndex.value = imageIndex
      previewImage.value = {
        url: file.url,
        name: getDisplayName(file.name),
        size: formatFileSize(file.size)
      }
      previewVisible.value = true
    }
  }

  // 关闭预览
  const closePreview = () => {
    previewVisible.value = false
  }

  // 导航预览
  const navigatePreview = (index) => {
    previewIndex.value = index
    const file = imageFiles.value[index]
    if (file) {
      previewImage.value = {
        url: file.url,
        name: getDisplayName(file.name),
        size: formatFileSize(file.size)
      }
    }
  }

  // 獲取檔案圖標
const getFileIcon = (type) => {
  if (type?.includes('image')) return '🖼️'
  if (type?.includes('video')) return '🎥'
  if (type?.includes('audio')) return '🎵'
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('text')) return '📝'
  if (type?.includes('zip') || type?.includes('rar')) return '📦'
  return '📁'
}

  // 獲取顯示名稱（去掉時間戳前綴）
const getDisplayName = (name) => {
  if (!name) return ''
  const parts = name.split('_')
  if (parts.length > 1 && /^\d+$/.test(parts[0])) {
    return parts.slice(1).join('_')
  }
  return name
}

  // 格式化檔案大小
const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

  // 格式化檔案類型
const formatFileType = (type) => {
  if (!type) return '未知类型'
  return type.split('/')[1]?.toUpperCase() || type
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

  // 監聽刷新觸發器
const watchRefreshTrigger = () => {
  if (props.refreshTrigger > 0) {
    fetchFiles()
  }
}

onMounted(() => {
  fetchFiles()
})

    // 監聽props變化
  import { watch } from 'vue'
  watch(() => props.refreshTrigger, watchRefreshTrigger)

  // 强制下载文件的工具函数
  const forceDownload = (url, filename) => {
    // 创建隐藏的 iframe 来触发下载
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    
    // 3秒后移除 iframe
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 3000)
  }
</script>
