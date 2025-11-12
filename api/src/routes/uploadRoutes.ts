import { Router, Router as ExpressRouter } from 'express'
import multer from 'multer'
import { FileUploadController } from '../controllers/FileUploadController'
import { authMiddleware } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'
import { UserRole } from '../entities/User'
import { config } from '../config'

const router: ExpressRouter = Router()
const fileUploadController = new FileUploadController()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = file.originalname.split('.').pop()
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`)
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
})

// File upload routes
router.post('/image', authMiddleware, upload.single('image'), fileUploadController.uploadImage)
router.post('/images', authMiddleware, upload.array('images', 10), fileUploadController.uploadMultipleImages)
router.delete('/image/:filename', authMiddleware, roleMiddleware([UserRole.ADMIN]), fileUploadController.deleteImage)

export default router
