import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFileMetadata(
    userId: string,
    file: Express.Multer.File,
    entityType: string,
  ) {
    return this.prisma.client.fileUpload.create({
      data: {
        uploaderId: userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileUrl: `/uploads/${file.filename}`,
      },
    });
  }
}
