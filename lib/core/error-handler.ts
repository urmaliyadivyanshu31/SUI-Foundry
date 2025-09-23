import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface APIError {
  code: string
  message: string
  details?: any
  timestamp: string
  requestId: string
}

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: any
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT_ERROR', 409, details)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429)
  }
}

export class BlockchainError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'BLOCKCHAIN_ERROR', 500, details)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, details)
  }
}

// Error handler middleware for API routes
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Add request ID to headers for tracing
      const response = await handler(req)
      response.headers.set('X-Request-ID', requestId)
      return response
    } catch (error) {
      return handleAPIError(error, requestId)
    }
  }
}

export function handleAPIError(error: unknown, requestId: string): NextResponse {
  const timestamp = new Date().toISOString()
  
  // Log error for debugging
  console.error('API Error:', {
    requestId,
    timestamp,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError ? {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      } : {})
    } : error
  })

  // Handle known error types
  if (error instanceof AppError) {
    const apiError: APIError = {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp,
      requestId
    }
    
    return NextResponse.json({ error: apiError }, { 
      status: error.statusCode,
      headers: {
        'X-Request-ID': requestId,
        'Content-Type': 'application/json'
      }
    })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const apiError: APIError = {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      })),
      timestamp,
      requestId
    }
    
    return NextResponse.json({ error: apiError }, { 
      status: 400,
      headers: {
        'X-Request-ID': requestId,
        'Content-Type': 'application/json'
      }
    })
  }

  // Handle unexpected errors
  const apiError: APIError = {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    timestamp,
    requestId
  }
  
  return NextResponse.json({ error: apiError }, { 
    status: 500,
    headers: {
      'X-Request-ID': requestId,
      'Content-Type': 'application/json'
    }
  })
}

// Client-side error handling utility
export class APIClient {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const requestId = response.headers.get('X-Request-ID')
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = errorData.error as APIError
      
      if (error) {
        throw new AppError(
          error.message,
          error.code,
          response.status,
          { ...error.details, requestId: error.requestId || requestId }
        )
      }
      
      throw new AppError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status,
        { requestId }
      )
    }
    
    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    
    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    
    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return this.handleResponse<T>(response)
  }
}

// Error retry utility
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        break
      }
      
      // Don't retry on certain error types
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError || 
          error instanceof AuthorizationError ||
          error instanceof NotFoundError) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Circuit breaker pattern for external services
export class CircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 300000 // 5 minutes
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new ExternalServiceError('Circuit Breaker', 'Service temporarily unavailable')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState(): string {
    return this.state
  }

  getFailureCount(): number {
    return this.failures
  }
}

// Global error handlers for client-side
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // You could send this to an error tracking service
    // trackError('unhandled_promise_rejection', event.reason)
    
    // Prevent the default behavior (logging to console)
    event.preventDefault()
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error)
    
    // You could send this to an error tracking service
    // trackError('uncaught_error', event.error)
  })
}

// Error tracking utility (can be extended with external services)
export function trackError(type: string, error: any, context?: any): void {
  const errorReport = {
    type,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
  }
  
  // Log locally
  console.error('Tracked error:', errorReport)
  
  // TODO: Send to external error tracking service (Sentry, LogRocket, etc.)
  // This would be where you'd integrate with your error tracking service
}