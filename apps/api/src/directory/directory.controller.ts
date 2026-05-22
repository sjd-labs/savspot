import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { DirectoryService } from './directory.service';
import { SearchDirectoryDto } from './dto/search-directory.dto';
import { RequiresLicense } from '@savspot/ee';

@ApiTags('Directory')
@Throttle({ default: { limit: 60, ttl: 60_000 } })

@RequiresLicense()
@Controller('directory')
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search the business directory' })
  @ApiResponse({ status: 200, description: 'Paginated search results' })
  async search(@Query() dto: SearchDirectoryDto) {
    return this.directoryService.search(dto);
  }

  @Get('categories')
  @Public()
  @ApiOperation({
    summary: 'List business categories that have ≥ privacy-floor live tenants',
    description:
      'Returns only categories with enough published tenants to avoid identifying individual businesses. Empty in early-platform conditions — use /category-options for the static enum list.',
  })
  @ApiResponse({ status: 200, description: 'List of populated categories with counts' })
  async getCategories() {
    return this.directoryService.getCategories();
  }

  @Get('category-options')
  @Public()
  @ApiOperation({
    summary: 'List every supported business category with label + description',
    description:
      'Static, always non-empty. Bind directory filter dropdowns, tenant-onboarding category pickers, and SEO landing pages to this.',
  })
  @ApiResponse({ status: 200, description: 'All BusinessCategory enum values with display copy' })
  getCategoryOptions() {
    return this.directoryService.getCategoryOptions();
  }

  @Get('businesses/:slug')
  @Public()
  @ApiOperation({ summary: 'Get business profile by slug' })
  @ApiResponse({ status: 200, description: 'Business profile' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessBySlug(@Param('slug') slug: string) {
    return this.directoryService.getBusinessBySlug(slug);
  }

  @Get('businesses/:slug/reviews')
  @Public()
  @ApiOperation({ summary: 'Get reviews for a business' })
  @ApiResponse({ status: 200, description: 'Paginated reviews' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessReviews(
    @Param('slug') slug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.directoryService.getBusinessReviews(slug, page ?? 1, limit ?? 10);
  }

  @Get('businesses/:slug/availability')
  @Public()
  @ApiOperation({ summary: 'Get availability for a business' })
  @ApiResponse({ status: 200, description: 'Availability rules' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessAvailability(@Param('slug') slug: string) {
    return this.directoryService.getBusinessAvailability(slug);
  }
}
