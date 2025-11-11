import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { config } from '../config'
import { sendSuccess, sendError } from '../utils'

export class FileUploadController {
  uploadImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400)
      }

      const fileUrl = `/uploads/${req.file.filename}`
      
      return sendSuccess(res, {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }, 'Image uploaded successfully')
    } catch (error) {
      console.error('Upload image error:', error)
      return sendError(res, 'Failed to upload image', 500, error)
    }
  }

  uploadMultipleImages = async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return sendError(res, 'No files uploaded', 400)
      }

      const files = req.files as Express.Multer.File[]
      const uploadedFiles = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`
      }))

      return sendSuccess(res, {
        files: uploadedFiles,
        count: uploadedFiles.length
      }, 'Images uploaded successfully')
    } catch (error) {
      console.error('Upload multiple images error:', error)
      return sendError(res, 'Failed to upload images', 500, error)
    }
  }

  deleteImage = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params
      const filePath = path.join(config.upload.uploadPath, filename)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return sendError(res, 'File not found', 404)
      }

      // Delete file
      fs.unlinkSync(filePath)

      return sendSuccess(res, { filename }, 'Image deleted successfully')
    } catch (error) {
      console.error('Delete image error:', error)
      return sendError(res, 'Failed to delete image', 500, error)
    }
  }
}