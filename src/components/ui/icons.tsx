import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function LogoMark(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 3 21 7.5v9L12 21l-9-4.5v-9L12 3Z" />
      <path d="M12 3v9m0 0 9-4.5M12 12 3 7.5M12 12v9" />
    </svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  );
}

export function PenToolIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 19l7-7a2.8 2.8 0 0 0-4-4l-7 7v4h4Z" />
      <path d="m13 6 5 5" />
      <path d="M3 21l5-1.5L17.5 10" />
      <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Printer3dIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
      <path d="M4 9h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z" />
      <path d="M7 16v3h10v-3" />
      <path d="M8 12h8" />
      <path d="M17 5v.01M18.5 6.5v.01" strokeWidth="2.2" />
    </svg>
  );
}

export function CogIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.7 5.3l-1.7 1.7M7 16.9l-1.7 1.7M18.7 18.7 17 17M7 7.1 5.3 5.3" />
    </svg>
  );
}

export function FlaskIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M9 3h6" />
      <path d="M10 3v6.2L4.8 18a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3L14 9.2V3" />
      <path d="M7.5 14h9" />
    </svg>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M14.5 6.5a4 4 0 0 0-5.4-3.7L12 5.8 5.8 12 3.3 9.5a4 4 0 0 0 3.7 5.4L5 20a2 2 0 0 0 2.8 2.8l5.1-2-3-3" />
      <path d="m14.5 6.5 3.3 3.4 2.8-.4L22 11l-2.4 2.4-1.5-1.5" />
    </svg>
  );
}

export function MoldIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 3h11v7H4z" />
      <path d="M9 6.5h2M20 3h-5v7h5z" transform="translate(0 10)" />
      <path d="M8 20h2M14 20h2" />
      <path d="M7 14H5v4h4v-4H7.5" />
    </svg>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M21 8.5 12 3l-9 5.5v7L12 21l9-5.5v-7Z" />
      <path d="M3.2 8.5 12 14l8.8-5.5M12 14v7" />
    </svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3" y="7" width="18" height="10" rx="1.5" />
      <path d="M6 7v4M9.5 7v3M13 7v4M16.5 7v3M20 7v4" />
    </svg>
  );
}

export function RulerCompassIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="5" r="1.6" />
      <path d="m12 6.6-8 11M12 6.6l8 11" />
      <path d="M9 13.2v2.3M15 13.2v2.3" />
      <path d="M6.5 21h11" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M20 12H4" />
      <path d="m10 6-6 6 6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 4h4l1.5 4-2 1.5a12 12 0 0 0 6 6L16 13l4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
      <path d="M9 8.2c0 4.6 3.5 8.1 8.1 8.1.4 0 .8 0 1.1-.1.5-.2 1-1 .9-1.8l-2.2-1.1c-.3-.1-.7-.4-.9-.2l-.9.7c-.2.2-.4.2-.6-.1a6.4 6.4 0 0 1-1.6-2.1c0-.2 0-.4.2-.5l.7-.8c.2-.3.1-.7 0-.9L10.2 6c-.3-.5-1-.7-1.5-.3-.2.1-.3.8-.3 1.4 0 .2 0 .6.1 1Z" strokeWidth="1.4" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
      <path d="M3 16v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 7h16M10 4h4M6 7l1 13h10l1-13M9 11v6M15 11v6" />
    </svg>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 3c.9 4.6 1.9 5.6 6.5 6.5-4.6.9-5.6 1.9-6.5 6.5-.9-4.6-1.9-5.6-6.5-6.5 4.6-.9 5.6-1.9 6.5-6.5Z" />
      <path d="M19 17.5c.4 2 .8 2.4 2.8 2.8-2 .4-2.4.8-2.8 2.8-.4-2-.8-2.4-2.8-2.8 2-.4 2.4-.8 2.8-2.8Z" strokeWidth="1.4" />
    </svg>
  );
}

const socialProps: IconProps = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true };

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...socialProps} {...props}>
      <path d="M14 8h3V4.5h-3c-2 0-3.5 1.5-3.5 3.5V11H8v3.5h2.5v6h3.5v-6h3l.6-3.5h-3.6V8.8c0-.5.2-.8 1-.8Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...socialProps} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg {...socialProps} {...props}>
      <path d="M5.5 9v9M5.5 5.5v.01M10 18v-5.5a3 3 0 0 1 6 0V18M10 9v9" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...socialProps} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...socialProps} {...props}>
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...socialProps} {...props}>
      <path d="M14.5 4v10.6a3.4 3.4 0 1 1-3-3.37" />
      <path d="M14.5 6.6c.7 1.8 2.3 3 4.5 3.2" />
    </svg>
  );
}