import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

interface ValidationErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
  details?: Array<{
    field: string;
    constraints: string[];
  }>;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter extends BaseExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const exceptionResponse = exception.getResponse();
    const status = exception.getStatus();

    let details: Array<{ field: string; constraints: string[] }> = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as any;
      if (Array.isArray(resp.message)) {
        details = resp.message.map((msg: string) => {
          const [field, ...constraintParts] = msg.split(' ');
          return {
            field: field.replace(/"/g, ''),
            constraints: [constraintParts.join(' ')],
          };
        });
      }
    }

    const errorResponse: ValidationErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Validation failed',
      error: 'Bad Request',
      details,
    };

    response.status(status).json(errorResponse);
  }
}
