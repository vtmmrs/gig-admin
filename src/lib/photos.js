import { supabase } from './supabase'
import { uid } from './utils'

export function resizeImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.85)
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('That file is not a valid image'))
    img.src = URL.createObjectURL(file)
  })
}

export async function uploadPhoto(file, userId) {
  if (!userId) throw new Error('Sign in to upload photos')
  const blob = await resizeImage(file)
  const path = `${userId}/${uid()}.jpg`
  const { error } = await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw new Error(error.message)
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}
