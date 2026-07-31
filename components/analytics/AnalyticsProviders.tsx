"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";

export function AnalyticsProviders() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Basic Page View tracking for custom analytics if needed
  useEffect(() => {
    if (pathname) {
      // You can add custom pageview tracking logic here
      // console.log('Pageview:', pathname);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* GA4 */}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX"} />

      {/* GTM */}
      <GoogleTagManager
        gtmId={process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX"}
      />

      {/* Meta Pixel */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || "XXXXXXXXXXXXXXXX"}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
}
