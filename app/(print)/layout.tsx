import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Print Document",
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased print:bg-white print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @media print {
            ::-webkit-scrollbar { display: none; }
          }
        `}} />
        {children}
      </body>
    </html>
  );
}
