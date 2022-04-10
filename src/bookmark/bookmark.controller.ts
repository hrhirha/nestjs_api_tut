import { Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    
    @Post()
    createBookmark() {}

    @Get()
    getBookmarks() {}
    
    @Get()
    getBookmarkById() {}
    
    @Patch()
    editBookmarkbyId() {}

    @Delete()
    deleteBookmarkById() {}
}
