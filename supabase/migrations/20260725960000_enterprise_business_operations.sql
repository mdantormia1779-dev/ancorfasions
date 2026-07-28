-- Enterprise Business Operations Platform Schema

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ORGANIZATION ARCHITECTURE
-- ==========================================

-- Business Units
CREATE TABLE public.business_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_office_address TEXT,
    tax_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_unit_id UUID REFERENCES public.business_units(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'retail' CHECK (type IN ('retail', 'office', 'kiosk', 'flagship')),
    address TEXT NOT NULL,
    region VARCHAR(100),
    timezone VARCHAR(100) DEFAULT 'Asia/Dhaka',
    operating_hours JSONB DEFAULT '{"monday": {"open": "10:00", "close": "20:00"}}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses (Table already exists, adding new columns for operations platform)
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS business_unit_id UUID REFERENCES public.business_units(id) ON DELETE CASCADE;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS warehouse_code VARCHAR(50) UNIQUE;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS capacity_sqft NUMERIC;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance'));

-- Warehouse Zones (Table already exists, adding new columns)
ALTER TABLE public.warehouse_zones ADD COLUMN IF NOT EXISTS description TEXT;

-- ==========================================
-- 2. DEPARTMENT & TEAM STRUCTURE
-- ==========================================

-- Departments (Table already exists, adding new columns for operations platform)
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS head_user_id UUID; -- References auth.users or employee_profiles
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Teams
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    lead_user_id UUID, -- References auth.users or employee_profiles
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Profiles
CREATE TABLE public.employee_profiles (
    id UUID PRIMARY KEY, -- References auth.users(id)
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(150),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
    employment_status VARCHAR(50) DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'terminated', 'probation')),
    role_level VARCHAR(50) DEFAULT 'staff' CHECK (role_level IN ('executive', 'admin', 'manager', 'lead', 'staff')),
    hire_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys for department heads and team leads
ALTER TABLE public.departments ADD CONSTRAINT fk_department_head FOREIGN KEY (head_user_id) REFERENCES public.employee_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.teams ADD CONSTRAINT fk_team_lead FOREIGN KEY (lead_user_id) REFERENCES public.employee_profiles(id) ON DELETE SET NULL;

-- ==========================================
-- 3. WORKFLOW & TASK MANAGEMENT
-- ==========================================

-- Workflow Templates
CREATE TABLE public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Node-based workflow definition
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_instance_id UUID, -- Nullable, if part of a larger workflow
    assignee_id UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'review', 'done')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Dependencies
CREATE TABLE public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'blocking' CHECK (dependency_type IN ('blocking', 'related')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id)
);

-- Task Comments
CREATE TABLE public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. GOVERNANCE & APPROVAL FRAMEWORK
-- ==========================================

-- Approval Workflows
CREATE TABLE public.approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'product_publish', 'price_change', 'refund'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    tiers JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of approver roles/users and rules
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Requests (Table already exists, adding new columns for operations platform)
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.approval_workflows(id) ON DELETE CASCADE;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS context_data JSONB DEFAULT '{}'::jsonb;

-- Approval Steps (Individual approver actions)
CREATE TABLE public.approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.approval_requests(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
    tier_level INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
    comments TEXT,
    action_taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. DOCUMENT & SOP MANAGEMENT
-- ==========================================

-- SOPs (Standard Operating Procedures)
CREATE TABLE public.sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    author_id UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOP Acknowledgements
CREATE TABLE public.sop_acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID REFERENCES public.sops(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    UNIQUE(sop_id, employee_id)
);

-- Documents Repository
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100) NOT NULL, -- 'policy', 'contract', 'training', 'manual'
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES public.employee_profiles(id) ON DELETE SET NULL,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Access Logs
CREATE TABLE public.document_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('view', 'download', 'print')),
    ip_address INET,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. INDEXES & PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_employee_department ON public.employee_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_branch ON public.employee_profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester ON public.approval_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_steps_request ON public.approval_steps(request_id);
CREATE INDEX IF NOT EXISTS idx_sops_department ON public.sops(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_department ON public.documents(department_id);

-- ==========================================
-- 7. RLS & POLICIES (Enterprise Governance)
-- ==========================================

ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Basic Policies (To be expanded in application layer based on RBAC/ABAC)
CREATE POLICY "Public Read Access for Business Units" ON public.business_units FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Branches" ON public.branches FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Access for Departments" ON public.departments FOR SELECT USING (status = 'active');

CREATE POLICY "Employees can view their own profile and team" ON public.employee_profiles FOR SELECT 
USING (id = auth.uid() OR department_id IN (
    SELECT department_id FROM public.employee_profiles WHERE id = auth.uid()
));

CREATE POLICY "Employees can view their assigned tasks" ON public.tasks FOR SELECT 
USING (assignee_id = auth.uid() OR reporter_id = auth.uid() OR department_id IN (
    SELECT department_id FROM public.employee_profiles WHERE id = auth.uid()
));

CREATE POLICY "Employees can update their assigned tasks" ON public.tasks FOR UPDATE 
USING (assignee_id = auth.uid());

CREATE POLICY "Employees can view published SOPs for their department" ON public.sops FOR SELECT 
USING (status = 'published' AND (department_id IS NULL OR department_id IN (
    SELECT department_id FROM public.employee_profiles WHERE id = auth.uid()
)));
