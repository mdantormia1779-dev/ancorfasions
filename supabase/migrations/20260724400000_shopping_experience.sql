-- ==========================================
-- Anchor Fashion - Shopping Experience Schema
-- ==========================================

-- Drop old simplified tables from init migration to upgrade to the new architecture
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;

-- ==========================================
-- 1. CARTS
-- ==========================================
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(cart_id, variant_id)
);

-- ==========================================
-- 2. WISHLISTS
-- ==========================================
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) DEFAULT 'My Wishlist',
    is_default BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE, -- Optional, if they saved a specific size
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(wishlist_id, product_id)
);

-- ==========================================
-- 3. REVIEWS
-- ==========================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    body TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(product_id, user_id) -- One review per product per user
);

CREATE TABLE public.review_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    media_url VARCHAR(1024) NOT NULL,
    media_type VARCHAR(20) DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 4. PRODUCT Q&A
-- ==========================================
CREATE TABLE public.product_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.product_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.product_questions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Could be staff or customer
    answer TEXT NOT NULL,
    is_official BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 5. TRIGGERS
-- ==========================================
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON public.wishlists FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_product_questions_updated_at BEFORE UPDATE ON public.product_questions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_product_answers_updated_at BEFORE UPDATE ON public.product_answers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_answers ENABLE ROW LEVEL SECURITY;

-- Carts
CREATE POLICY "Users can manage their own carts" ON public.carts FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own cart items" ON public.cart_items FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Wishlists
CREATE POLICY "Users can manage their own wishlists" ON public.wishlists FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own wishlist items" ON public.wishlist_items FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid())
);

-- Reviews (Public read, Authenticated write)
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Users can view their own pending/rejected reviews" ON public.reviews FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Review media is viewable by everyone" ON public.review_media FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.reviews WHERE reviews.id = review_media.review_id AND reviews.status = 'APPROVED')
);
CREATE POLICY "Users can add media to their reviews" ON public.review_media FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.reviews WHERE reviews.id = review_media.review_id AND reviews.user_id = auth.uid())
);

-- Q&A (Public read, Authenticated write)
CREATE POLICY "Approved questions are viewable by everyone" ON public.product_questions FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Users can view their own questions" ON public.product_questions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can ask questions" ON public.product_questions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Approved answers are viewable by everyone" ON public.product_answers FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Users can answer questions" ON public.product_answers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
