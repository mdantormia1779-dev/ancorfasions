-- ============================================================================
-- Migration: Enterprise Finance & Expense Management Module
-- Table: public.expenses
-- ============================================================================

-- Ensure uuid extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'scheduled', 'cancelled')),
    vendor VARCHAR(255) NOT NULL DEFAULT '',
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    payment_method VARCHAR(100) NOT NULL DEFAULT 'CASH',
    receipt_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Indexes for efficient filtering and reporting
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_warehouse_id ON public.expenses(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_expenses_branch_id ON public.expenses(branch_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at DESC);

-- 3. Automatic updated_at trigger
DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Authenticated staff/admins can view expenses
DROP POLICY IF EXISTS "Staff can view expenses" ON public.expenses;
CREATE POLICY "Staff can view expenses"
ON public.expenses FOR SELECT
USING (auth.role() = 'authenticated');

-- Authenticated staff/admins can insert expenses
DROP POLICY IF EXISTS "Staff can insert expenses" ON public.expenses;
CREATE POLICY "Staff can insert expenses"
ON public.expenses FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated staff/admins can update expenses
DROP POLICY IF EXISTS "Staff can update expenses" ON public.expenses;
CREATE POLICY "Staff can update expenses"
ON public.expenses FOR UPDATE
USING (auth.role() = 'authenticated');

-- Authenticated staff/admins can delete expenses
DROP POLICY IF EXISTS "Staff can delete expenses" ON public.expenses;
CREATE POLICY "Staff can delete expenses"
ON public.expenses FOR DELETE
USING (auth.role() = 'authenticated');
