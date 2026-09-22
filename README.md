# Anchor Fashion (অ্যাঙ্কর ফ্যাশন) - Enterprise E-Commerce & ERP Platform

> **Next.js 16 (Turbopack) • Supabase (PostgreSQL + RLS) • Tailwind CSS • Serwist PWA • Alpha SMS BD • bKash • SSLCommerz**

---

## 📌 সূচিপত্র (Table of Contents)

1. [প্রকল্প পরিচিতি (Overview)](#-প্রকল্প-পরিচিতি-overview)
2. [মূল ফিচারসমূহ (Core Features)](#-মূল-ফিচারসমূহ-core-features)
   - [কাস্টমার স্টোরফ্রন্ট (Customer Storefront)](#1-কাস্টমার-স্টোরফ্রন্ট-customer-storefront)
   - [চেকআউট ও পেমেন্ট গেটওয়ে (Checkout & Payments)](#2-চেকআউট-ও-পেমেন্ট-গেটওয়ে-checkout--payments)
   - [অর্ডার ম্যানেজমেন্ট সিস্টেম (OMS)](#3-অর্ডার-ম্যানেজমেন্ট-সিস্টেম-oms)
   - [ওয়্যারহাউস ও ইনভেন্টরি ম্যানেজমেন্ট (Warehouse & Inventory ERP)](#4-ওয়্যারহাউস-ও-ইনভেন্টরি-ম্যানেজমেন্ট-warehouse--inventory-erp)
   - [আলফা এসএমএস গেটওয়ে (Alpha SMS Gateway)](#5-আলফা-এসএমএস-গেটওয়ে-alpha-sms-gateway)
   - [রিটার্নস ও রিভার্স লজিস্টিকস (Returns & Reverse Logistics)](#6-রিটার্নস-ও-রিভার্স-লজিস্টিকস-returns--reverse-logistics)
   - [গুগল জেমিনি এআই স্যুট (Google Gemini AI Suite)](#7-গুগল-জেমিনি-এআই-স্যুট-google-gemini-ai-suite)
3. [টেক স্ট্যাক (Technology Stack)](#-টেক-স্ট্যাক-technology-stack)
4. [ডিরেক্টরি স্ট্রাকচার (Project Directory Structure)](#-ডিরেক্টরি-স্ট্রাকচার-project-directory-structure)
5. [ইনস্টলেশন ও সেটআপ (Installation & Local Setup)](#-ইনস্টলেশন-ও-সেটআপ-installation--local-setup)
6. [পরিবেশ ভেরিয়েবল (Environment Variables)](#-পরিবেশ-ভেরিয়েবল-environment-variables)
7. [ডাটাবেস ও সিকিউরিটি আর্কিটেকচার (Database & Security Architecture)](#-ডাটাবেস-ও-সিকিউরিটি-আর্কিটেকচার-database--security-architecture)
8. [কমান্ড রানবুক (CLI & Command Runbook)](#-কমান্ড-রানবুক-cli--command-runbook)
9. [প্রোডাকশন ডেপ্লয়মেন্ট (Production Deployment)](#-প্রোডাকশন-ডেপ্লয়মেন্ট-production-deployment)
10. [সমস্যা সমাধান ও ট্রাবলশুটিং (Troubleshooting & FAQs)](#-সমস্যা-সমাধান-ও-ট্রাবলশুটিং-troubleshooting--faqs)

---

## 🌟 প্রকল্প পরিচিতি (Overview)

**Anchor Fashion** একটি আধুনিক, ফুল-স্ট্যাক ও এন্টারপ্রাইজ-গ্রেড ই-কমার্স ও ইআরপি (ERP) প্ল্যাটফর্ম। এটি সম্পূর্ণ বাংলাদেশী বাজার ও আন্তর্জাতিক ফ্যাশন ব্র্যান্ডের চাহিদার সাথে সঙ্গতি রেখে তৈরি। আধুনিক **Next.js 16**, **Supabase (PostgreSQL)**, **Tailwind CSS**, **bKash Tokenized Gateway**, **SSLCommerz**, এবং **Alpha SMS** এর সমন্বয়ে এটি সর্বোচ্চ পারফরম্যান্স, নির্ভুল ইনভেন্টরি এবং মিলিমিটার-লেভেল সিকিউরিটি নিশ্চিত করে।

---

## 🚀 মূল ফিচারসমূহ (Core Features)

### 1. কাস্টমার স্টোরফ্রন্ট (Customer Storefront)
- **হাই-স্পিড নেভিগেশন**: Next.js Server Components ও Turbopack দ্বারা চালিত অল্ট্রা-ফাস্ট পেজ লোডিং।
- **স্মার্ট কার্ট ও অটো-মার্জ**: গেস্ট ইউজার হিসেবে প্রোডাক্ট কার্টে যোগ করে পরবর্তীতে লগইন করলে গেস্ট কার্ট ডাটাবেসের ইউজার কার্টের সাথে নির্বিঘ্নে মার্জ হয়।
- **মাল্টিপল সাইজ ও কালার ভেরিয়েন্ট সিলেকশন**: রিয়েল-টাইম স্টক অ্যাভেইলেবিলিটি যাচাই এবং ডাইনামিক প্রাইসিং।
- **অফলাইন সাপোর্ট (PWA)**: Serwist সার্ভিস ওয়ার্কার ইন্টিগ্রেশন, ইন্টারনেট ড্রপ হলেও ইউজার ক্যাশড পেজ দেখতে পারে।

### 2. চেকআউট ও পেমেন্ট গেটওয়ে (Checkout & Payments)
- **Cash on Delivery (COD)**: ঢাকার ভেতরে (৳৮০) এবং ঢাকার বাইরে (৳১৫০) স্বয়ংক্রিয় ডেলিভারি চার্জ ক্যালকুলেশন।
- **bKash Tokenized Checkout**:
  - গ্রাহক রিডাইরেক্টের পর সার্ভার-টু-সার্ভার অথেনটিকেশন (`executePayment`)।
  - অর্ডার এমাউন্ট ও কারেন্সি নিখুঁতভাবে মেলানো (Amount Tampering Protection)।
  - লেইট কলব্যাক রেস কন্ডিশন হ্যান্ডলিং (বাতিল হওয়া অর্ডারের জন্য স্বয়ংক্রিয় `REFUND_PENDING` ফ্ল্যাগ)।
- **SSLCommerz Hosted Gateway**:
  - অফিশিয়াল `validationserverAPI.php` সার্ভার-সাইড কল করে লেনদেন যাচাই।
  - গ্রাহক ব্রাউজার সাকসেস/ক্যান্সেল/ফেল কলব্যাক ও ব্যাকগ্রাউন্ড IPN (Instant Payment Notification) ওয়েবহুক সাপোর্ট।
  - পেমেন্ট ফেইল হলে কুপন ও রিজার্ভ করা ইনভেন্টরি তাৎক্ষণিক মুক্তকরণ।

### 3. অর্ডার ম্যানেজমেন্ট সিস্টেম (OMS)
- পূর্ণাঙ্গ লাইফসাইকেল ট্র্যাকিং: `pending_payment` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered` / `cancelled`।
- রিয়েলটাইম অর্ডার ট্র্যাকিং পেজ (`/track-order`) কাস্টমারদের জন্য।
- প্রফেশনাল ইনভয়েস, প্যাকিং স্লিপ এবং শিপিং লেবেল জেনারেশন (`/admin/orders/[id]/invoice`)।

### 4. ওয়্যারহাউস ও ইনভেন্টরি ম্যানেজমেন্ট (Warehouse & Inventory ERP)
- **মাল্টি-ওয়্যারহাউস আর্কিটেকচার**: সেন্ট্রাল, হাব, রিটেল শপ এবং ফুলফিলমেন্ট সেন্টার তৈরি ও পরিচালনা।
- **জোন, রেক, এবং বিন/শেলফ ট্র্যাকিং**: ওয়্যারহাউসের ভেতরে সঠিক লোকেশনে পণ্য সংরক্ষিত রাখা।
- **স্টক ইনওয়ার্ড (Stock Inward / GRN)**:
  - প্রফেশনাল ও প্রিন্ট-রেডি গুডস রিসিভ নোট (GRN) ও চালান প্রিন্ট সুবিধা।
  - সাপ্লায়ার ড্রপডাউন এবং সরাসরি প্রোডাক্ট ভেরিয়েন্ট সিলেক্টর (কোনো ম্যানুয়াল UUID লিখতে হয় না)।
- **স্টক মুভমেন্ট, ট্রান্সফার ও এডজাস্টমেন্ট**: প্রতিটি ওয়্যারহাউসের মধ্যে স্টক মুভমেন্ট হিস্ট্রি ও সম্পূর্ণ অডিট লগ।
- **লো-স্টক অ্যালার্ট**: নির্দিষ্ট থ্রেশহোল্ডের নিচে নামলে এডমিনদের স্বয়ংক্রিয় নোটিফিকেশন।

### 5. আলফা এসএমএস গেটওয়ে (Alpha SMS Gateway)
- অফিসিয়াল বাংলাদেশী মোবাইল নম্বর ভ্যালিডেশন (১১ ডিজিট: `01XXXXXXXXX` বা ১৩ ডিজিট: `8801XXXXXXXXX`)।
- অর্ডার সফল হলে কাস্টমারের মোবাইলে তাৎক্ষণিক কনফার্মেশন এসএমএস প্রেরণ।
- এসএমএস ফেইলিওর হ্যান্ডলিং এবং ডাটাবেসে রিয়েলটাইম অডিট হিস্ট্রি লগ।
- আইডিভিত্তিক অর্ডার এসএমএস রিসেন্ড প্রটেকশন (IDOR & Rate-limiting Protected)।

### 6. রিটার্নস ও রিভার্স লজিস্টিকস (Returns & Reverse Logistics)
- স্টেট মেশিন (`requested` ➔ `approved` ➔ `received` ➔ `inspected` ➔ `completed`)।
- ডাবল-রিফান্ড প্রতিরোধক কনকারেন্সি লক ও আইডেমপোটেন্ট রেস্টক ইঞ্জিন।
- ব্রাঞ্চ-ভিত্তিক সিকিউর রিটার্ন অথোরাইজেশন ও কাস্টমার ওয়ালেট রিফান্ড সাপোর্ট।

### 7. গুগল জেমিনি এআই স্যুট (Google Gemini AI Suite)
- ব্যবসায়িক এনালাইটিক্স ইনসাইটস ও প্রম্পট অ্যাসিস্ট্যান্ট।
- ক্যাটালগ প্রোডাক্ট ডেসক্রিপশন এবং এসইও (SEO) মেটাডাটা অটো-জেনারেশন।

---

## 🛠 টেক স্ট্যাক (Technology Stack)

| স্তর (Layer) | প্রযুক্তি (Technology) | বিবরণ (Details) |
|---|---|---|
| **Framework** | Next.js 16.2.12 | App Router, Server Actions, Turbopack Bundler |
| **Language** | TypeScript 5.8 | Strict Type Checking, 0 Type Errors |
| **Styling** | Tailwind CSS + shadcn/ui | Radix UI Primitives, Responsive Grid & Flexbox |
| **Database & Auth** | Supabase (PostgreSQL 15) | Row Level Security (RLS), Atomic RPC Functions |
| **PWA & Offline** | Serwist | Service Worker, Offline Asset Caching |
| **Payments** | bKash Tokenized + SSLCommerz | Server Verification, Idempotency Locks, IPN |
| **SMS** | Alpha SMS Bangladesh | Transactional SMS, Delivery Logs |
| **AI** | Google Gemini SDK | Multimodal & Text Generation |
| **Testing** | Vitest | 25 Suites, 83 Passing Unit & Integration Tests |

---

## 📂 ডিরেক্টরি স্ট্রাকচার (Project Directory Structure)

```
anchorfashion/
├── actions/                  # Next.js Server Actions (Warehouse, Inventory, CMS, CRM, Users)
├── app/                      # Next.js 16 App Router
│   ├── (storefront)/         # কাস্টমার ফেসিং শপ, কার্ট, চেকআউট, প্রোডাক্ট পেজ
│   ├── account/              # কাস্টমার একাউন্ট, অর্ডার, রিওয়ার্ড, রিটার্ন ও প্রোফাইল
│   ├── admin/                # এডমিন ড্যাশবোর্ড, ওয়্যারহাউস ERP, ইনভেন্টরি, রিপোর্ট
│   ├── api/                  # ব্যাকএন্ড API রাউটস
│   │   ├── cron/             # সিকিউর ক্রন জবস (queue, release-reservations, campaigns)
│   │   ├── orders/           # অর্ডার সম্পর্কিত API (SMS লগ ও রিসেন্ড)
│   │   ├── payment/          # bKash ও SSLCommerz গেটওয়ে কলব্যাক ও IPN
│   │   ├── store/            # স্টোরফ্রন্ট এপিআই (অর্ডার প্লেসমেন্ট, প্রোডাক্ট)
│   │   └── warehouses/       # ওয়্যারহাউস এপিআই এন্ডপয়েন্টস
│   └── manager/              # ব্রাঞ্চ ও অপারেশন ম্যানেজার ড্যাশবোর্ড
├── components/               # রিইউজেবল UI কম্পোনেন্টস (shadcn/ui, modals, navigation)
├── lib/                      # কোর লাইব্রেরি, সুপাবেস ক্লায়েন্ট ও পেমেন্ট সার্ভিসেস
├── proxy.ts                  # Next.js 16 Edge Proxy (Middleware, Auth, Rate Limiting, CSP)
├── repositories/             # ডাটা এক্সেস লেয়ার (Warehouse, Inventory, Orders, CRM)
├── services/                 # বিজনেস লজিক সার্ভিসেস (Inventory, Coupon, Marketing, Warehouse)
├── tests/                    # Vitest ইন্টিগ্রেশন ও ইউনিট টেস্ট স্যুট (83 Tests)
├── types/                    # গ্লোবাল টাইপ ডেফিনিশন (Inventory, OMS, Payments)
├── .env.example              # এনভায়রনমেন্ট কনফিগারেশন টেমপ্লেট
└── next.config.ts            # নেক্সট.জেএস কনফিগ, ইমেজ রিমোট প্যাটার্ন ও সিকিউরিটি হেডার
```

---

## 💻 ইনস্টলেশন ও সেটআপ (Installation & Local Setup)

### ১. রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/your-username/anchorfashion.git
cd anchorfashion
```

### ২. ডিপেন্ডেন্সি ইনস্টল করুন
```bash
npm install
```

### ৩. পরিবেশ ভেরিয়েবল সেটআপ করুন
`.env.example` ফাইলটি কপি করে `.env.local` অথবা `.env` ফাইল তৈরি করুন:
```bash
copy .env.example .env
```
এরপর প্রয়োজনীয় Supabase Keys, Payment Keys, এবং SMS API Keys বসিয়ে দিন।

### ৪. ডেভেলপমেন্ট সার্ভার চালু করুন
```bash
npm run dev
```
ব্রাউজারে ভিজিট করুন: `http://localhost:3000`

---

## 🔑 পরিবেশ ভেরিয়েবল (Environment Variables)

`.env.example` ফাইলে প্রতিটি ভেরিয়েবলের বিশদ বিবরণ দেওয়া রয়েছে:

```env
# --- Application URLs ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=production

# --- Supabase Database & Auth ---
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# --- Payment Gateways (bKash & SSLCommerz) ---
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password

SSLCOMMERZ_STORE_ID=your_sslcommerz_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sslcommerz_store_password
SSLCOMMERZ_IS_SANDBOX=false

# --- SMS Gateway (Alpha SMS Bangladesh) ---
ALPHA_SMS_API_KEY=your_alpha_sms_api_key
SMS_ENABLED=true
SMS_TEST_MODE=false

# --- Cron Jobs Security ---
CRON_SECRET=your_high_entropy_random_32_char_secret

# --- AI Suite ---
GEMINI_API_KEY=AIzaSy...
```

---

## 🛡 ডাটাবেস ও সিকিউরিটি আর্কিটেকচার (Database & Security Architecture)

1. **Row Level Security (RLS)**:
   - সুপাবেস ডাটাবেসের সমস্ত টেবিলে RLS সক্রিয়।
   - কাস্টমাররা কেবলমাত্র তাদের নিজস্ব অর্ডার ও প্রোফাইল ডাটা রিড করতে পারে।
   - এডমিন ও ম্যানেজাররা `service_role` ও অথেনটিকেটেড রোল-বেসড পলিসির মাধ্যমে পরিচালিত হন।
2. **Atomic Inventory Reservation (`release_order_inventory`)**:
   - অর্ডার প্লেস হওয়ার সাথে সাথে ডাটাবেস লেভেলে স্টক হোল্ড হয়।
   - কোনো কাস্টমার পেমেন্ট বাতিল করলে বা ৫ মিনিট পর সেশন এক্সপায়ার হলে পিজি-এসকিউএল (PostgreSQL) এটমিক RPC ফাংশনের মাধ্যমে ব্যাকগ্রাউন্ডে স্টক মুক্ত হয়।
3. **Next.js 16 Edge Proxy (`proxy.ts`)**:
   - `/admin/*`, `/manager/*`, `/account/*` ইত্যাদি রাউটে সরাসরি ভূমিকা ভিত্তিক প্রবেশাধিকার (RBAC) নিয়ন্ত্রণ।
   - কঠোর Content-Security-Policy (CSP), Rate Limiting এবং XSS প্রটেকশন।
4. **ক্রন সিকিউরিটি (Cron Secret Guard)**:
   - `/api/cron/*` এন্ডপয়েন্টগুলো `Bearer <CRON_SECRET>` টোকেন ছাড়া সম্পূর্ণভাবে ৪০১ আনঅথরাইজড ফেরত দেয়।

---

## ⚡ কমান্ড রানবুক (CLI & Command Runbook)

| কমান্ড (Command) | কাজ ও ফলাফল (Description & Outcome) |
|---|---|
| `cmd.exe /c "npx tsc --noEmit"` | সম্পূর্ণ প্রজেক্টের টাইপস্ক্রিপ্ট কম্পাইলেশন যাচাই (0 Errors). |
| `cmd.exe /c "npm run test"` | সম্পূর্ণ ২৫টি টেস্ট ফাইলের ৮৩টি ইন্টিগ্রেশন ও ইউনিট টেস্ট চালানো (All 83 Passed). |
| `cmd.exe /c "npm run build"` | প্রোডাকশন বিল্ড তৈরি করা (Next.js Turbopack, ৬৬টি পেজ সহ সফল বিল্ড). |
| `cmd.exe /c "npm run dev"` | লোকাল ডেভেলপমেন্ট সার্ভার শুরু করা (`http://localhost:3000`). |
| `cmd.exe /c "npm run lint"` | কোড স্টাইল ও লিন্ট কোয়ালিটি পরীক্ষা. |

---

## 🚀 প্রোডাকশন ডেপ্লয়মেন্ট (Production Deployment)

### Vercel Deployment
1. গিটহাবে আপনার ব্রাঞ্চ পুশ করুন।
2. Vercel ড্যাশবোর্ডে প্রজেক্ট ইমপোর্ট করুন।
3. Framework Preset হিসেবে **Next.js** নিশ্চিত করুন।
4. Environment Variables সেকশনে প্রোডাকশন কী-গুলো (`SUPABASE_SERVICE_ROLE_KEY`, `BKASH_*`, `SSLCOMMERZ_*`, `CRON_SECRET`, `ALPHA_SMS_API_KEY`) বসিয়ে দিন।
5. Vercel Cron স্বয়ংক্রিয়ভাবে `vercel.json` এর মাধ্যমে প্রতি ৫ মিনিটে এক্সপায়ার্ড রিজার্ভেশন ক্লিনআপ করবে:
```json
{
  "crons": [
    {
      "path": "/api/cron/release-expired-reservations",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/process-queue",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

---

## ❓ সমস্যা সমাধান ও ট্রাবলশুটিং (Troubleshooting & FAQs)

**প্রশ্ন ১: সাপ্লায়ার বা ওয়্যারহাউস তৈরি করার সময় ত্রুটি দেখালে কী করবেন?**  
- **উত্তর**: নিশ্চিত হোন যে এডমিন ক্লায়েন্ট ব্যবহার করা হয়েছে। ইনভেন্টরি পেজের ড্রপডাউনগুলো সরাসরি ডাটাবেস থেকে রিয়েল-টাইমে পণ্য ও ভেরিয়েন্ট লোড করে। কোনো ম্যানুয়াল আইডি টাইপ করার প্রয়োজন নেই।

**প্রশ্ন ২: লোকাল টেস্ট মোডে এসএমএস ব্যালেন্স কাটছে কি?**  
- **উত্তর**: না। `.env` ফাইলে `SMS_TEST_MODE=true` থাকলে আলফা এসএমএস এর আসল ব্যালেন্স কাটবে না; কনসোলে সুন্দর মক রিকোয়েস্ট লগ দেখতে পাবেন। প্রোডাকশনে এটিকে `false` করে আসল এসএমএস চালু করতে হবে।

**প্রশ্ন ৩: উইন্ডোজে `npx.ps1` পলিসি এরর দিলে কী করবেন?**  
- **উত্তর**: উইন্ডোজের রেস্ট্রিক্টেড পলিসির কারণে সরাসরি পাওয়ারশেলে স্ক্রিপ্ট ব্লক হতে পারে। সবসময় `cmd.exe /c "npm run ..."` অথবা `cmd.exe /c "npx ..."` ব্যবহার করুন।

---

© 2026 **Anchor Fashion Ltd.** সর্বস্বত্ব সংরক্ষিত (All rights reserved).
বাংলা ও ইংরেজি উভয় ভাষায় সম্পূর্ণ প্রফেশনাল ব্যবহারের জন্য প্রস্তুত।
