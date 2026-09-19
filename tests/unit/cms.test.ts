import { describe, it, expect, vi } from "vitest";
import { CMSService } from "@/services/cms.service";

vi.mock("@/repositories/cms.repository", () => {
  return {
    CMSRepository: class {
      getPages = vi
        .fn()
        .mockResolvedValue([
          { id: "1", title: "Home", slug: "home", status: "published" },
        ]);
      getPageBySlug = vi
        .fn()
        .mockResolvedValue({
          id: "1",
          title: "Home",
          slug: "home",
          status: "published",
        });
      createPage = vi
        .fn()
        .mockResolvedValue({
          id: "2",
          title: "About",
          slug: "about",
          status: "draft",
        });
    },
  };
});

describe("CMSService", () => {
  const service = new CMSService();

  it("should fetch pages", async () => {
    const pages = await service.getPages();
    expect(pages).toHaveLength(1);
    expect(pages[0].title).toBe("Home");
  });

  it("should fetch page by slug", async () => {
    const page = await service.getPageBySlug("home");
    expect(page).toBeDefined();
    expect(page?.slug).toBe("home");
  });

  it("should create page with valid data", async () => {
    const newPage = await service.createPage({
      title: "About",
      slug: "about",
      author_id: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(newPage.title).toBe("About");
  });
});
