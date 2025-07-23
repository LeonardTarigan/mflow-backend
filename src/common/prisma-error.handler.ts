import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Logger } from 'winston';

type PrismaErrorCode =
  | 'P2002'
  | 'P2003'
  | 'P2022'
  | 'P2023'
  | 'P2025'
  | 'P2010'
  | 'P2016';

const defaultPrismaErrors: Record<
  PrismaErrorCode,
  { status: HttpStatus; defaultMessage: string }
> = {
  P2002: {
    status: HttpStatus.BAD_REQUEST,
    defaultMessage: 'Data sudah terdaftar!',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    defaultMessage: 'Data terkait tidak ditemukan!',
  },
  P2022: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    defaultMessage: 'Kolom tidak ditemukan di database!',
  },
  P2023: {
    status: HttpStatus.BAD_REQUEST,
    defaultMessage: 'Format ID tidak valid!',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    defaultMessage: 'Data tidak ditemukan!',
  },
  P2010: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    defaultMessage: 'Kesalahan query SQL!',
  },
  P2016: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    defaultMessage: 'Field wajib tidak boleh bernilai null!',
  },
};

export function handlePrismaError(
  error: unknown,
  logger: Logger,
  customMessages?: Partial<Record<PrismaErrorCode, string>>,
): void {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code in defaultPrismaErrors
  ) {
    const { status, defaultMessage } =
      defaultPrismaErrors[error.code as PrismaErrorCode];
    const message =
      customMessages?.[error.code as PrismaErrorCode] ?? defaultMessage;

    logger.error(`Prisma Error ${error.code}: "${message}"`, {
      meta: error.meta,
      stack: error.stack,
    });

    throw new HttpException(message, status);
  }

  throw error;
}
