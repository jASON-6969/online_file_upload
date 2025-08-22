<template>
  <div class="w-full max-w-4xl mx-auto">
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
                    @click="downloadFile(file)"
                    class="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                    :title="file.name"
                  >
                    {{ getDisplayName(file.name) }}
                  </button>
                  <span v-if="file.size" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {{ formatFileSize(file.size) }}
                  </span>
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
                 class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
               >
                 下載
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
import { ref, onMounted } from 'vue'
import { getFiles, deleteFile as deleteFileFromSupabase } from '../lib/supabase'

const props = defineProps({
  refreshTrigger: {
    type: Number,
    default: 0
  }
})

const files = ref([])
const loading = ref(false)

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
const downloadFile = (file) => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = getDisplayName(file.name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
</script>
