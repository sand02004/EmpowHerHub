import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFileMetadata(userId: string, file: Express.Multer.File, entityType: string) {
    const id = crypto.randomUUID();
    const storedName = file.filename || `${Date.now()}-${file.originalname}`;
    await this.prisma.client.$executeRaw`
      INSERT INTO "FileUpload" (id, "uploaderId", "originalName", "mimeType", "fileSize", "fileUrl", "createdAt")
      VALUES (${id}, ${userId}, ${file.originalname}, ${file.mimetype}, ${file.size}, ${`/uploads/${storedName}`}, NOW())
    `;
    const rows: any[] = await this.prisma.client.$queryRaw`
      SELECT * FROM "FileUpload" WHERE id = ${id}
    `;
    return rows[0];
  }
}
