import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1 bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
            <p className="text-muted-foreground mt-2">Last updated: October 24, 2024</p>
          </div>
          
          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed">
                By accessing and placing an order with Anchor Fashion, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Anchor Fashion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Products and Pricing</h2>
              <p className="text-slate-600 leading-relaxed">
                All products listed on the website are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Orders and Payments</h2>
              <p className="text-slate-600 leading-relaxed">
                We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. We accept major credit cards, digital wallets, and Cash on Delivery (COD) subject to location availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Shipping and Returns</h2>
              <p className="text-slate-600 leading-relaxed">
                Please review our dedicated Shipping & Returns policy for detailed information regarding delivery times, courier partners, and our return process. Anchor Fashion utilizes third-party courier services (e.g., Pathao, Steadfast) and is not liable for delays caused by the courier network.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Loyalty Program and Wallet</h2>
              <p className="text-slate-600 leading-relaxed">
                Loyalty points and digital wallet balances hold no cash value outside of the Anchor Fashion ecosystem and cannot be withdrawn as fiat currency. We reserve the right to modify the points conversion rate or revoke points in cases of suspected fraud or abuse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Information</h2>
              <p className="text-slate-600 leading-relaxed">
                Questions about the Terms of Service should be sent to us at support@anchorfashion.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
