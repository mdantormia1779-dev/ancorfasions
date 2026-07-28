export type CMSPageStatus = 'draft' | 'published' | 'archived';

export interface CMSPage {
    id: string;
    title: string;
    slug: string;
    status: CMSPageStatus;
    author_id: string;
    published_at: Date | null;
    layout_data: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

export interface CMSSection {
    id: string;
    name: string;
    type: string;
    content: Record<string, any>;
    is_global: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CMSNavigation {
    id: string;
    name: string;
    location: string;
    items: Array<{ label: string; url: string; target?: string; children?: any[] }>;
    created_at: Date;
    updated_at: Date;
}
