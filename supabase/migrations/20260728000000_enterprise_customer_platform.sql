-- ========================================================================================
-- ENTERPRISE CUSTOMER ACCOUNT, PROFILE, LOYALTY, WALLET & SELF-SERVICE PLATFORM
-- ========================================================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CUSTOMER PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    avatar_url VARCHAR(1024),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 2. CUSTOMER ADDRESSES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    title VARCHAR(100), -- e.g., 'Home', 'Office'
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Bangladesh',
    is_default_shipping BOOLEAN DEFAULT false,
    is_default_billing BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure only one default shipping/billing address per customer via partial index
CREATE UNIQUE INDEX idx_unique_default_shipping 
ON public.customer_addresses(customer_id) 
WHERE is_default_shipping = true;

CREATE UNIQUE INDEX idx_unique_default_billing 
ON public.customer_addresses(customer_id) 
WHERE is_default_billing = true;

-- ==========================================
-- 3. CUSTOMER WALLETS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
    currency VARCHAR(3) DEFAULT 'BDT' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 4. WALLET TRANSACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.customer_wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    balance_after DECIMAL(12, 2) NOT NULL CHECK (balance_after >= 0),
    reference_type VARCHAR(50) NOT NULL, -- e.g., 'ORDER_REFUND', 'BONUS', 'PAYMENT'
    reference_id UUID, -- ID of the order or refund
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 5. LOYALTY ACCOUNTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE UNIQUE,
    tier VARCHAR(20) DEFAULT 'SILVER' CHECK (tier IN ('SILVER', 'GOLD', 'PLATINUM', 'VIP')),
    points_balance INTEGER DEFAULT 0 CHECK (points_balance >= 0),
    total_points_earned INTEGER DEFAULT 0 CHECK (total_points_earned >= 0),
    total_points_redeemed INTEGER DEFAULT 0 CHECK (total_points_redeemed >= 0),
    tier_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 6. LOYALTY TRANSACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loyalty_account_id UUID REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('EARN', 'REDEEM', 'EXPIRE', 'ADJUSTMENT')),
    points INTEGER NOT NULL, -- positive or negative
    description TEXT,
    reference_type VARCHAR(50), -- e.g., 'ORDER', 'REFERRAL', 'BIRTHDAY'
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 7. CUSTOMER REVIEWS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, -- Null if review is not verified purchase
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    review_text TEXT,
    images TEXT[], -- Array of image URLs
    is_approved BOOLEAN DEFAULT false, -- Requires admin approval
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 8. CUSTOMER NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('ORDER_UPDATE', 'PROMOTION', 'SYSTEM', 'SUPPORT', 'SECURITY')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(1024),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 9. CUSTOMER DEVICES (For Security/Management)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    device_name VARCHAR(100), -- e.g., 'MacBook Pro', 'iPhone 14'
    device_type VARCHAR(50), -- 'DESKTOP', 'MOBILE', 'TABLET'
    os VARCHAR(50),
    browser VARCHAR(50),
    ip_address VARCHAR(45),
    is_trusted BOOLEAN DEFAULT false,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 10. CUSTOMER SESSIONS (Login History)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.customer_devices(id) ON DELETE SET NULL,
    session_token VARCHAR(255) UNIQUE, -- optional sync with auth.sessions
    ip_address VARCHAR(45),
    location VARCHAR(100), -- e.g., 'Dhaka, Bangladesh'
    login_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    logout_time TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.customer_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_customer_profiles_updated_at
BEFORE UPDATE ON public.customer_profiles
FOR EACH ROW EXECUTE PROCEDURE public.customer_update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at
BEFORE UPDATE ON public.customer_addresses
FOR EACH ROW EXECUTE PROCEDURE public.customer_update_updated_at_column();

CREATE TRIGGER update_customer_wallets_updated_at
BEFORE UPDATE ON public.customer_wallets
FOR EACH ROW EXECUTE PROCEDURE public.customer_update_updated_at_column();

CREATE TRIGGER update_loyalty_accounts_updated_at
BEFORE UPDATE ON public.loyalty_accounts
FOR EACH ROW EXECUTE PROCEDURE public.customer_update_updated_at_column();

CREATE TRIGGER update_customer_reviews_updated_at
BEFORE UPDATE ON public.customer_reviews
FOR EACH ROW EXECUTE PROCEDURE public.customer_update_updated_at_column();

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

-- 1. Create Wallet and Loyalty Account on Profile Creation
CREATE OR REPLACE FUNCTION public.initialize_customer_accounts()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customer_wallets (customer_id, balance, currency)
    VALUES (NEW.id, 0.00, 'BDT');
    
    INSERT INTO public.loyalty_accounts (customer_id, tier, points_balance)
    VALUES (NEW.id, 'SILVER', 0);
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER on_customer_profile_created
AFTER INSERT ON public.customer_profiles
FOR EACH ROW EXECUTE PROCEDURE public.initialize_customer_accounts();


-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_customer_addresses_customer ON public.customer_addresses(customer_id);
CREATE INDEX idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX idx_loyalty_transactions_account ON public.loyalty_transactions(loyalty_account_id);
CREATE INDEX idx_customer_reviews_product ON public.customer_reviews(product_id);
CREATE INDEX idx_customer_reviews_customer ON public.customer_reviews(customer_id);
CREATE INDEX idx_customer_notifications_customer ON public.customer_notifications(customer_id);
CREATE INDEX idx_customer_devices_customer ON public.customer_devices(customer_id);
CREATE INDEX idx_customer_sessions_customer ON public.customer_sessions(customer_id);


-- ==========================================
-- RLS (ROW LEVEL SECURITY)
-- ==========================================
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own
DROP POLICY IF EXISTS "Users view own profile" ON public.customer_profiles;
CREATE POLICY "Users view own profile" ON public.customer_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON public.customer_profiles;
CREATE POLICY "Users update own profile" ON public.customer_profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses: Users can CRUD their own
DROP POLICY IF EXISTS "Users view own addresses" ON public.customer_addresses;
CREATE POLICY "Users view own addresses" ON public.customer_addresses FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users insert own addresses" ON public.customer_addresses;
CREATE POLICY "Users insert own addresses" ON public.customer_addresses FOR INSERT WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users update own addresses" ON public.customer_addresses;
CREATE POLICY "Users update own addresses" ON public.customer_addresses FOR UPDATE USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users delete own addresses" ON public.customer_addresses;
CREATE POLICY "Users delete own addresses" ON public.customer_addresses FOR DELETE USING (auth.uid() = customer_id);

-- Wallets: View only, no direct insert/update from frontend
DROP POLICY IF EXISTS "Users view own wallet" ON public.customer_wallets;
CREATE POLICY "Users view own wallet" ON public.customer_wallets FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users view own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (
    wallet_id IN (SELECT id FROM public.customer_wallets WHERE customer_id = auth.uid())
);

-- Loyalty: View only
DROP POLICY IF EXISTS "Users view own loyalty account" ON public.loyalty_accounts;
CREATE POLICY "Users view own loyalty account" ON public.loyalty_accounts FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users view own loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Users view own loyalty transactions" ON public.loyalty_transactions FOR SELECT USING (
    loyalty_account_id IN (SELECT id FROM public.loyalty_accounts WHERE customer_id = auth.uid())
);

-- Reviews: Insert, update, view
DROP POLICY IF EXISTS "Anyone views approved reviews" ON public.customer_reviews;
CREATE POLICY "Anyone views approved reviews" ON public.customer_reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Users view own reviews" ON public.customer_reviews;
CREATE POLICY "Users view own reviews" ON public.customer_reviews FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users insert own reviews" ON public.customer_reviews;
CREATE POLICY "Users insert own reviews" ON public.customer_reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users update own reviews" ON public.customer_reviews;
CREATE POLICY "Users update own reviews" ON public.customer_reviews FOR UPDATE USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users delete own reviews" ON public.customer_reviews;
CREATE POLICY "Users delete own reviews" ON public.customer_reviews FOR DELETE USING (auth.uid() = customer_id);

-- Notifications: View, update read status
DROP POLICY IF EXISTS "Users view own notifications" ON public.customer_notifications;
CREATE POLICY "Users view own notifications" ON public.customer_notifications FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users update own notifications" ON public.customer_notifications;
CREATE POLICY "Users update own notifications" ON public.customer_notifications FOR UPDATE USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users delete own notifications" ON public.customer_notifications;
CREATE POLICY "Users delete own notifications" ON public.customer_notifications FOR DELETE USING (auth.uid() = customer_id);

-- Devices & Sessions: View, delete (revoke access)
DROP POLICY IF EXISTS "Users view own devices" ON public.customer_devices;
CREATE POLICY "Users view own devices" ON public.customer_devices FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users update own devices" ON public.customer_devices;
CREATE POLICY "Users update own devices" ON public.customer_devices FOR UPDATE USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users delete own devices" ON public.customer_devices;
CREATE POLICY "Users delete own devices" ON public.customer_devices FOR DELETE USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users view own sessions" ON public.customer_sessions;
CREATE POLICY "Users view own sessions" ON public.customer_sessions FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users delete own sessions" ON public.customer_sessions;
CREATE POLICY "Users delete own sessions" ON public.customer_sessions FOR DELETE USING (auth.uid() = customer_id);

-- ========================================================================================
-- END MIGRATION
-- ========================================================================================
