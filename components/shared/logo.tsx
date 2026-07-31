"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Playfair_Display, Jost } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
});
const jost = Jost({ subsets: ["latin"], weight: ["400", "500"] });

export const AnchorFashionLogo = ({
  className,
  isLoading = false,
  noLink = false,
}: {
  className?: string;
  isLoading?: boolean;
  noLink?: boolean;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const innerContent = (
    <>
      <style>{`
        .af-draw-gold {
          fill: #C9A86A;
          stroke: #C9A86A;
          stroke-width: 1px;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: af-draw-loop 6s cubic-bezier(0.64, 0.04, 0.35, 1) infinite;
        }

        .af-draw-blue {
          fill: #122B59;
          stroke: #122B59;
          stroke-width: 0.8px;
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
          animation: af-draw-loop 6s cubic-bezier(0.64, 0.04, 0.35, 1) infinite;
        }

        .af-draw-line {
          stroke: #122B59;
          stroke-width: 1.5px;
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: af-draw-line-loop 6s cubic-bezier(0.64, 0.04, 0.35, 1) infinite;
        }

        @keyframes af-draw-loop {
          0% { stroke-dashoffset: 1500; fill-opacity: 0; }
          25% { stroke-dashoffset: 0; fill-opacity: 0; }
          35% { stroke-dashoffset: 0; fill-opacity: 1; }
          75% { stroke-dashoffset: 0; fill-opacity: 1; }
          85% { stroke-dashoffset: 0; fill-opacity: 0; }
          100% { stroke-dashoffset: 1500; fill-opacity: 0; }
        }

        @keyframes af-draw-line-loop {
          0% { stroke-dashoffset: 300; opacity: 1; }
          25% { stroke-dashoffset: 0; opacity: 1; }
          35% { stroke-dashoffset: 0; opacity: 1; }
          75% { stroke-dashoffset: 0; opacity: 1; }
          85% { stroke-dashoffset: 0; opacity: 0; }
          95% { stroke-dashoffset: 300; opacity: 0; }
          100% { stroke-dashoffset: 300; opacity: 1; }
        }
      `}</style>

      {/* SVG Canvas for the Perfect Anchor Fashion Logo */}
      <svg
        viewBox="0 0 440 130"
        className="h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ visibility: mounted ? "visible" : "hidden" }}
      >
        <defs>
          {/* Mask to cut out the standard crossbar of the 'A' */}
          <mask id="a-crossbar-cut">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect x="0" y="55" width="100" height="15" fill="black" />
          </mask>
        </defs>

        {/* 1. The Gold 'A' */}
        <g mask="url(#a-crossbar-cut)">
          <text
            x="15"
            y="80"
            className={`af-draw-gold ${playfair.className}`}
            style={{ fontSize: "90px", fontWeight: "500" }}
          >
            A
          </text>
        </g>

        {/* 2. The Custom Gold Swoosh across the 'A' */}
        <path
          d="M 5 65 Q 45 35 95 68 Q 50 50 15 73 Z"
          className="af-draw-gold"
          style={{ strokeWidth: "0.5px" }}
        />

        {/* 3. The 'NCHOR' text in Dark Blue */}
        <text
          x="105"
          y="80"
          className={`af-draw-blue ${playfair.className}`}
          style={{ fontSize: "66px", fontWeight: "600", letterSpacing: "2px" }}
        >
          NCHOR
        </text>

        {/* 4. The 'FASHION' text below */}
        <text
          x="145"
          y="118"
          className={`af-draw-blue ${jost.className}`}
          style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "9px" }}
        >
          FASHION
        </text>

        {/* 5. Left and Right Lines next to FASHION */}
        <path d="M 35 112 L 125 112" className="af-draw-line" fill="none" />
        <path d="M 290 112 L 380 112" className="af-draw-line" fill="none" />
      </svg>
    </>
  );

  const containerProps = {
    className: `flex select-none items-center ${className || ""}`,
    "aria-label": "Anchor Fashion Home",
    style: {
      maxWidth: "280px",
      verticalAlign: "middle",
      boxSizing: "border-box",
    },
  };

  if (noLink) {
    return <div {...containerProps}>{innerContent}</div>;
  }

  return (
    <Link href="/" {...containerProps}>
      {innerContent}
    </Link>
  );
};
