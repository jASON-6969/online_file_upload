import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 環境變數')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 檔案上傳函數
export const uploadFile = async (file, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from('files')
      .upload(fileName, file)
    
    if (error) throw error
    
    // 獲取檔案公共URL
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(fileName)
    
    // 儲存檔案資訊到資料庫
    const { error: dbError } = await supabase
      .from('file_uploads')
      .insert([
        {
          name: fileName,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl
        }
      ])
    
    if (dbError) throw dbError
    
    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('上傳錯誤:', error)
    return { success: false, error: error.message }
  }
}

// 獲取檔案列表
export const getFiles = async () => {
  try {
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
          console.error('獲取錯誤:', error)
    return { success: false, error: error.message }
  }
}

// 刪除檔案
export const deleteFile = async (fileName) => {
  try {
    // 從儲存中刪除檔案
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([fileName])
    
    if (storageError) throw storageError
    
    // 從資料庫中刪除記錄
    const { error: dbError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('name', fileName)
    
    if (dbError) throw dbError
    
    return { success: true }
  } catch (error) {
    console.error('刪除錯誤:', error)
    return { success: false, error: error.message }
  }
}
