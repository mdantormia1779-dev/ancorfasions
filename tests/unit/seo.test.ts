import { describe, it, expect, vi } from "vitest";
import { SEOService } from "@/services/seo.service";

vi.mock("@/repositories/seo.repository", () => {
  return {
    SEORepository: class {
      getMetadataByEntity = vi
        .fn()
        .mockResolvedValue({
          id: "1",
          title: "SEO Title",
          entity_type: "page",
        });
      upsertMetadata = vi
        .fn()
        .mockResolvedValue({
          id: "1",
          title: "New Title",
          entity_type: "page",
        });
    },
  };
});

describe("SEOService", () => {
  const service = new SEOService();

  it("should fetch metadata", async () => {
    const metadata = await service.getMetadataByEntity("page", "123");
    expect(metadata?.title).toBe("SEO Title");
  });

  it("should upsert metadata", async () => {
    const meta = await service.upsertMetadata({
      entity_type: "page",
      entity_id: "123e4567-e89b-12d3-a456-426614174000",
      title: "New Title",
    });
    expect(meta.title).toBe("New Title");
  });
});
