import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '../utils'

interface ImageUploadProps {
  onImageUpload: (files: File[]) => void
  maxImages?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  existingImages?: string[]
}

export default function ImageUpload({ 
  onImageUpload, 
  maxImages = 5, 
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `不支持的文件格式: ${file.name}`
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `文件过大: ${file.name} (最大 ${maxSize}MB)`
    }
    
    return null
  }

  const handleFiles = (files: FileList) => {
    const newErrors: string[] = []
    const validFiles: File[] = []
    const newImageUrls: string[] = []

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      } else {
        validFiles.push(file)
        const imageUrl = URL.createObjectURL(file)
        newImageUrls.push(imageUrl)
      }
    })

    if (images.length + newImageUrls.length > maxImages) {
      newErrors.push(`最多只能上传 ${maxImages} 张图片`)
      // 清理已创建的URL
      newImageUrls.forEach(url => URL.revokeObjectURL(url))
      setErrors(newErrors)
      return
    }

    setErrors(newErrors)
    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...newImageUrls])
      onImageUpload(validFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const removeImage = (index: number) => {
    const imageUrl = images[index]
    URL.revokeObjectURL(imageUrl)
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400',
          images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={images.length >= maxImages ? undefined : triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {images.length >= maxImages ? '已达到最大上传数量' : '点击或拖拽上传图片'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              支持 {acceptedTypes.map(type => type.split('/')[1]).join(', ')} 格式
            </p>
            <p className="text-xs text-gray-400">
              单个文件最大 {maxSize}MB，最多 {maxImages} 张图片
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
            <div className="text-sm text-red-700">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              已上传图片 ({images.length}/{maxImages})
            </h3>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  images.forEach(url => URL.revokeObjectURL(url))
                  setImages([])
                }}
                className="text-sm text-red-600 hover:text-red-500"
              >
                清除所有
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={`上传图片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <ImageIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">上传建议：</p>
            <ul className="space-y-1 text-xs">
              <li>• 建议使用高质量、清晰的图片</li>
              <li>• 图片应该展示艺术品的完整细节</li>
              <li>• 避免上传包含水印或版权信息的图片</li>
              <li>• 推荐尺寸：正方形或4:3比例</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}