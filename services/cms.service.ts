import { CMSRepository } from '@/repositories/cms.repository';
import { cmsPageSchema, cmsSectionSchema, cmsNavigationSchema } from '@/validators/cms.schema';
import { CMSPage, CMSSection, CMSNavigation } from '@/types/cms.types';

const cmsRepository = new CMSRepository();

export class CMSService {
  async getPages(): Promise<CMSPage[]> {
    return await cmsRepository.getPages();
  }

  async getPageBySlug(slug: string): Promise<CMSPage | null> {
    return await cmsRepository.getPageBySlug(slug);
  }

  async createPage(data: unknown): Promise<CMSPage> {
    const validData = cmsPageSchema.parse(data);
    return await cmsRepository.createPage(validData);
  }

  async updatePage(id: string, data: unknown): Promise<CMSPage> {
    const validData = cmsPageSchema.partial().parse(data);
    return await cmsRepository.updatePage(id, validData);
  }

  async deletePage(id: string): Promise<void> {
    await cmsRepository.deletePage(id);
  }

  async getGlobalSections(): Promise<CMSSection[]> {
    return await cmsRepository.getGlobalSections();
  }

  async getNavigation(location: string): Promise<CMSNavigation | null> {
    return await cmsRepository.getNavigationByLocation(location);
  }
}

export const cmsService = new CMSService();
