import { Request, Response } from 'express'

export interface ApiResponse {
  success: boolean
  message: string
  data?: any
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const sendSuccess = (res: Response, data: any, message: string = 'Success', pagination?: any) => {
  const response: ApiResponse = {
    success: true,
    message,
    data
  }

  if (pagination) {
    response.pagination = pagination
  }

  return res.json(response)
}

export const sendError = (res: Response, message: string, statusCode: number = 400, error?: any) => {
  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  }

  return res.status(statusCode).json(response)
}

export const validateRequest = (req: Request, requiredFields: string[]): string[] => {
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
      missingFields.push(field)
    }
  }
  
  return missingFields
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export const formatPagination = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
}