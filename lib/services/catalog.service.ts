import {
  CatalogRepository,
  ProductListParams,
} from "@/repositories/catalog.repository";

export class CatalogService {
  /**
   * Get all active categories
   */
  static async getCategories() {
    return CatalogRepository.getCategories();
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 4) {
    return CatalogRepository.getFeaturedProducts(limit);
  }

  /**
   * Get newest products
   */
  static async getNewArrivals(limit = 4) {
    return CatalogRepository.getNewArrivals(limit);
  }

  /**
   * Get products with filtering and pagination
   */
  static async getProducts(params: ProductListParams) {
    return CatalogRepository.getProducts(params);
  }

  /**
   * Get a single product by slug
   */
  static async getProductBySlug(slug: string) {
    return CatalogRepository.getProductBySlug(slug);
  }
}
