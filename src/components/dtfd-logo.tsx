"use client";

import { useId } from "react";

export const DtfdLogo = ({ className }: { className?: string }) => {
  const uniqueId = useId();
  const filterId = `dtfd-invertFilter-${uniqueId}`;
  const maskId = `dtfd-invertMask-${uniqueId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 32"
      className={className}
      role="img"
      aria-label="DTFD Logo"
    >
      <defs>
        {/* Invert filter: invert RGB, keep alpha */}
        <filter id={filterId} colorInterpolationFilters="sRGB">
          {/* Convert to 1 - c */}
          <feComponentTransfer>
            <feFuncR type="table" tableValues="1 0" />
            <feFuncG type="table" tableValues="1 0" />
            <feFuncB type="table" tableValues="1 0" />
            <feFuncA type="identity" />
          </feComponentTransfer>
        </filter>

        {/* Mask from the two bottom paths: white = areas to invert */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <rect x="0" y="0" width="24" height="24" fill="black" />
          {/* Transformed paths from original, scaled/translated to fit 24x24 */}
          <g transform="translate(0,-3.05)">
            <path
              fill="white"
              d="M0,20.15l19.72.07c-.47-.72-3.4-5.02-8.64-5.6C4.39,13.86.23,19.81,0,20.15Z"
            />
            <path
              fill="white"
              d="M4.29,19.98h19.76c-.47.67-3.4,4.66-8.64,5.21-6.69.7-10.9-4.89-11.13-5.21Z"
            />
          </g>
        </mask>

        <style>
          {`.dot { fill: #231f20; }
          .waves { fill: #7c5cdb; mix-blend-mode: lighten; opacity: 1; }`}
        </style>
      </defs>

      {/* Base layer: circles and paths as in original, with vertical translation */}
      <g transform="translate(0,-3.05)">
        {/* Circles */}
        <circle className="dot" cx="6.93" cy="20.89" r="1" />
        <circle className="dot" cx="10.46" cy="26.08" r="1" />
        <circle className="dot" cx="12.04" cy="28.47" r="1.58" />
        <circle className="dot" cx="4.05" cy="21.06" r="1.65" />
        <circle className="dot" cx="3.82" cy="18.08" r="1.2" />
        <circle className="dot" cx="8.21" cy="15.97" r="1.37" />
        <circle className="dot" cx="19.71" cy="18.94" r="1.84" />
        <circle className="dot" cx="5.45" cy="15.7" r="1.4" />
        <circle className="dot" cx="14.05" cy="14.47" r="1.09" />
        <circle className="dot" cx="6.42" cy="18.49" r="1.4" />
        <circle className="dot" cx="11.44" cy="15.7" r="1.65" />
        <circle className="dot" cx="10.08" cy="19.49" r="2.15" />
        <circle className="dot" cx="13.74" cy="25.06" r="1.89" />
        <circle className="dot" cx="9.11" cy="28.21" r="1.25" />
        <circle className="dot" cx="10.58" cy="23.36" r="1.47" />
        <circle className="dot" cx="6.47" cy="24.83" r="2.64" />
        <circle className="dot" cx="8.52" cy="22.02" r=".67" />
        <circle className="dot" cx="9.45" cy="13.6" r="1.11" />
        <circle className="dot" cx="13.92" cy="16.66" r=".69" />
        <circle className="dot" cx="19.89" cy="15.97" r=".69" />
        <circle className="dot" cx="14.83" cy="12.09" r=".78" />
        <circle className="dot" cx="9.79" cy="11.65" r=".53" />
        <circle className="dot" cx="6.93" cy="13.6" r=".9" />
        <circle className="dot" cx="13.63" cy="18.87" r="1.11" />
        <circle className="dot" cx="19.89" cy="22.75" r="1.54" />
        <circle className="dot" cx="18.51" cy="25.84" r="1.35" />
        <circle className="dot" cx="15.14" cy="28" r="1.11" />
        <circle className="dot" cx="12.04" cy="12.45" r="1.37" />
        <circle className="dot" cx="13.1" cy="21.64" r="1.25" />
        <circle className="dot" cx="16.48" cy="24.55" r=".66" />
        <circle className="dot" cx="17.16" cy="28" r=".66" />
        <circle className="dot" cx="16.55" cy="21.63" r="1.81" />
        <circle className="dot" cx="16.3" cy="18.07" r="1.56" />
        <circle className="dot" cx="17.16" cy="14.6" r="1.8" />

        {/* Original decorative paths (optional visual baseline) */}
        <path
          className="waves"
          d="M0,20.15l19.72.07c-.47-.72-3.4-5.02-8.64-5.6C4.39,13.86.23,19.81,0,20.15Z"
        />
        <path
          className="waves"
          d="M4.29,19.98h19.76c-.47.67-3.4,4.66-8.64,5.21-6.69.7-10.9-4.89-11.13-5.21Z"
        />
      </g>

      {/* Inverted overlap: render circles again with invert filter, clipped by paths mask */}
      <g mask={`url(#${maskId})`} filter={`url(#${filterId})`}>
        <g transform="translate(0,-3.05)">
          <circle fill="#000000" cx="6.93" cy="20.89" r="1" />
          <circle fill="#000000" cx="10.46" cy="26.08" r="1" />
          <circle fill="#000000" cx="12.04" cy="28.47" r="1.58" />
          <circle fill="#000000" cx="4.05" cy="21.06" r="1.65" />
          <circle fill="#000000" cx="3.82" cy="18.08" r="1.2" />
          <circle fill="#000000" cx="8.21" cy="15.97" r="1.37" />
          <circle fill="#000000" cx="19.71" cy="18.94" r="1.84" />
          <circle fill="#000000" cx="5.45" cy="15.7" r="1.4" />
          <circle fill="#000000" cx="14.05" cy="14.47" r="1.09" />
          <circle fill="#000000" cx="6.42" cy="18.49" r="1.4" />
          <circle fill="#000000" cx="11.44" cy="15.7" r="1.65" />
          <circle fill="#000000" cx="10.08" cy="19.49" r="2.15" />
          <circle fill="#000000" cx="13.74" cy="25.06" r="1.89" />
          <circle fill="#000000" cx="9.11" cy="28.21" r="1.25" />
          <circle fill="#000000" cx="10.58" cy="23.36" r="1.47" />
          <circle fill="#000000" cx="6.47" cy="24.83" r="2.64" />
          <circle fill="#000000" cx="8.52" cy="22.02" r=".67" />
          <circle fill="#000000" cx="9.45" cy="13.6" r="1.11" />
          <circle fill="#000000" cx="13.92" cy="16.66" r=".69" />
          <circle fill="#000000" cx="19.89" cy="15.97" r=".69" />
          <circle fill="#000000" cx="14.83" cy="12.09" r=".78" />
          <circle fill="#000000" cx="9.79" cy="11.65" r=".53" />
          <circle fill="#000000" cx="6.93" cy="13.6" r=".9" />
          <circle fill="#000000" cx="13.63" cy="18.87" r="1.11" />
          <circle fill="#000000" cx="19.89" cy="22.75" r="1.54" />
          <circle fill="#000000" cx="18.51" cy="25.84" r="1.35" />
          <circle fill="#000000" cx="15.14" cy="28" r="1.11" />
          <circle fill="#000000" cx="12.04" cy="12.45" r="1.37" />
          <circle fill="#000000" cx="13.1" cy="21.64" r="1.25" />
          <circle fill="#000000" cx="16.48" cy="24.55" r=".66" />
          <circle fill="#000000" cx="17.16" cy="28" r=".66" />
          <circle fill="#000000" cx="16.55" cy="21.63" r="1.81" />
          <circle fill="#000000" cx="16.3" cy="18.07" r="1.56" />
          <circle fill="#000000" cx="17.16" cy="14.6" r="1.8" />
        </g>
      </g>
    </svg>
  );
};
