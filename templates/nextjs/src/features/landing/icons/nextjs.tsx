import type { ComponentProps } from "react";

export function NextjsIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 180 180" {...props}>
      <mask
        height="180"
        id="nextjs_icon_mask"
        maskUnits="userSpaceOnUse"
        width="180"
        x="0"
        y="0"
        style={{ maskType: "alpha" }}
      >
        <circle cx="90" cy="90" fill="currentColor" className="text-black dark:text-white" r="90" />
      </mask>
      <g mask="url(#nextjs_icon_mask)">
        <circle
          cx="90"
          cy="90"
          data-circle="true"
          fill="currentColor"
          className="text-black dark:text-white"
          r="90"
        />
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="url(#nextjs_icon_paint0)"
        />
        <rect fill="url(#nextjs_icon_paint1)" height="72" width="12" x="115" y="54" />
      </g>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="nextjs_icon_paint0"
          x1="109"
          x2="144.5"
          y1="116.5"
          y2="160.5"
        >
          <stop stopColor="currentColor" className="text-white dark:text-black" />
          <stop
            offset="1"
            stopColor="currentColor"
            stopOpacity="0"
            className="text-white dark:text-black"
          />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="nextjs_icon_paint1"
          x1="121"
          x2="120.799"
          y1="54"
          y2="106.875"
        >
          <stop stopColor="currentColor" className="text-white dark:text-black" />
          <stop
            offset="1"
            stopColor="currentColor"
            stopOpacity="0"
            className="text-white dark:text-black"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
