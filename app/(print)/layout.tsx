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
    <div className="bg-white text-black antialiased print:bg-white print:m-0 print:p-0 min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #ffffff !important; }
          @media print {
            ::-webkit-scrollbar { display: none; }
          }
        `,
        }}
      />
      {children}
    </div>
  );
}
