import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {

    constructor(private prisma: PrismaService) {}

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        return await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto,
            }
        });
    }

    async getBookmarks(userId: number) {
        return await this.prisma.bookmark.findMany({
            where: {
                userId,
            }
        });
    }
    
    async getBookmarkById(userId: number, bookmarkId: number) {
        return await this.prisma.bookmark.findFirst({
            where: {
                userId,
                id: bookmarkId,
            }
        });
    }
    
    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: {
                userId,
                id: bookmarkId,
            }
        });
        if (!bookmark)
            throw new ForbiddenException('bookmark not found');
        return await this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
            },
            data: {
                userId,
                ...dto,
            }
        });
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: {
                userId,
                id: bookmarkId,
            }
        });
        if (!bookmark)
            throw new ForbiddenException('bookmark not found');
        return await this.prisma.bookmark.delete({
            where: {
                id: bookmarkId,
            }
        });
    }
}
