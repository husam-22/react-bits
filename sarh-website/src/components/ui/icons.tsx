import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false
} as const;

/** Points to the reading direction's "forward" in Arabic (left). */
export const ArrowForward = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

/** Points "back" in Arabic (right). */
export const ArrowBack = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m6 6 12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.75v.01" />
  </svg>
);

export const AlertIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 4 2.75 19.5h18.5L12 4Z" />
    <path d="M12 10v4.5" />
    <path d="M12 17v.01" />
  </svg>
);

/* Service marks: thin architectural line drawings, sized on a 48px grid. */
const mark = { ...base, width: 48, height: 48, viewBox: '0 0 48 48', strokeWidth: 1.25 } as const;

export const TowerMark = (props: IconProps) => (
  <svg {...mark} {...props}>
    <path d="M6 42h36" />
    <path d="M10 42V22h10v20" />
    <path d="M20 42V8h12v34" />
    <path d="M32 42V18h8v24" />
    <path d="M24 14h4M24 20h4M24 26h4M24 32h4" />
  </svg>
);

export const CompassMark = (props: IconProps) => (
  <svg {...mark} {...props}>
    <circle cx="24" cy="9" r="3" />
    <path d="M22.6 11.7 11 40" />
    <path d="M25.4 11.7 37 40" />
    <path d="M14.5 31.5c3 1.7 6.2 2.5 9.5 2.5s6.5-.8 9.5-2.5" />
    <path d="M24 3v3" />
  </svg>
);

export const HelmetMark = (props: IconProps) => (
  <svg {...mark} {...props}>
    <path d="M6 34h36" />
    <path d="M9 34v-4a15 15 0 0 1 30 0v4" />
    <path d="M20 15.6V25M28 15.6V25" />
    <path d="M6 34v3h36v-3" />
  </svg>
);

export const LensMark = (props: IconProps) => (
  <svg {...mark} {...props}>
    <circle cx="21" cy="21" r="13" />
    <path d="m31 31 11 11" />
    <path d="M15 24v-6l6-4 6 4v6" />
    <path d="M15 24h12" />
  </svg>
);
