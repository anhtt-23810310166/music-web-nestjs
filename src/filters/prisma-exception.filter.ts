import { Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

export interface PrismaErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = HttpStatus.BAD_REQUEST;
    let message = 'Database error';
    let error = 'Prisma Error';

    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        message = 'A record with this value already exists';
        error = 'Conflict';
        break;
      case 'P2025': // Record not found
        message = 'Record not found';
        error = 'Not Found';
        break;
      case 'P2003': // Foreign key constraint failed
        message = 'Related record not found';
        error = 'Foreign Key Error';
        break;
      case 'P2004': // Constraint violation
        message = 'Constraint violation';
        error = 'Constraint Error';
        break;
      default:
        this.logger.error(
          `Prisma error ${exception.code}: ${exception.message}`,
        );
        message = 'Database operation failed';
        error = 'Database Error';
    }

    const errorResponse: PrismaErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    response.status(status).json(errorResponse);
  }
}
