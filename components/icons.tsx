import type { Mode } from "@/lib/types";

type IconProps = { className?: string };

export function ModeIcon({ mode, className = "w-4 h-4" }: { mode: Mode; className?: string }) {
  switch (mode) {
    case "metro":
      // Metro train, front view: rounded cab, single windscreen, splayed legs.
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2.2C8.4 2.2 5 2.7 5 6v9a3 3 0 0 0 3 3l-1.6 2.3a.6.6 0 0 0 .49.95H8a.6.6 0 0 0 .5-.26L10.2 18.8h3.6l1.7 2.19a.6.6 0 0 0 .5.26h1.11a.6.6 0 0 0 .49-.95L16 18a3 3 0 0 0 3-3V6c0-3.3-3.4-3.8-7-3.8Zm-5.2 4.4C6.8 5.9 9.1 5.7 12 5.7s5.2.2 5.2.9v3.1a1 1 0 0 1-1 1H7.8a1 1 0 0 1-1-1V6.6ZM8.6 12.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm6.8 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z"
          />
        </svg>
      );
    case "rail":
      // Suburban rail, front view: same train form with a split windscreen.
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2.2C8.4 2.2 5 2.7 5 6v9a3 3 0 0 0 3 3l-1.6 2.3a.6.6 0 0 0 .49.95H8a.6.6 0 0 0 .5-.26L10.2 18.8h3.6l1.7 2.19a.6.6 0 0 0 .5.26h1.11a.6.6 0 0 0 .49-.95L16 18a3 3 0 0 0 3-3V6c0-3.3-3.4-3.8-7-3.8Zm-5.2 4.4C6.8 5.9 9.1 5.7 12 5.7s5.2.2 5.2.9v3.1a1 1 0 0 1-1 1h-3.6V5.85h-.6V10.6H7.8a1 1 0 0 1-1-1V6.6ZM8.6 12.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm6.8 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z"
          />
        </svg>
      );
    case "bus":
      // Bus, side view with window band and two wheels.
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 3.5h12A3 3 0 0 1 21 6.5v8.5a2 2 0 0 1-1.5 1.94v.56a1.5 1.5 0 0 1-3 0v-.5h-9v.5a1.5 1.5 0 0 1-3 0v-.56A2 2 0 0 1 3 15V6.5a3 3 0 0 1 3-3Zm.5 3A1.5 1.5 0 0 0 5 8v2.5A1.5 1.5 0 0 0 6.5 12h11A1.5 1.5 0 0 0 19 10.5V8a1.5 1.5 0 0 0-1.5-1.5h-11ZM7.5 13.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm9 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z"
          />
        </svg>
      );
    case "walk":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13" cy="4" r="1.6" />
          <path d="M13 7l-2 4 3 2 1 5M11 11l-3 2-1 4M14 13l3 1" />
        </svg>
      );
    case "auto":
      // Auto-rickshaw: domed canopy cabin, sloped front, two visible wheels.
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.5 15.6V11A6.5 6.5 0 0 1 10 4.5a6.5 6.5 0 0 1 6.4 5.5h1.85A2.75 2.75 0 0 1 21 12.75V15a1 1 0 0 1-1 1h-.6a2.7 2.7 0 0 0-5.34 0H9.94a2.7 2.7 0 0 0-5.34 0H4.5a1 1 0 0 1-1-.4Zm4-5.6a5.02 5.02 0 0 1 5-3.5V10H7.5Zm5-3.5a5.02 5.02 0 0 1 4.45 3.5H12.5V6.5Z"
          />
          <circle cx="7.25" cy="16.7" r="2.05" fill="currentColor" />
          <circle cx="16.25" cy="16.7" r="2.05" fill="currentColor" />
        </svg>
      );
  }
}

export function ShieldIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ClockIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function RupeeIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5h10M7 9h10M7 5c5 0 7 2 7 5 0 4-4 4-7 4l6 6" />
    </svg>
  );
}

export function TransferIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  );
}

export function ShareIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}

export function AlertIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17v.5" />
    </svg>
  );
}

export function PinIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  );
}

export function ComfortIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      <path d="M4 11a2 2 0 0 1 2 2v3h12v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5H2v-5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function SparkleIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </svg>
  );
}

export function InfoIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.5" />
    </svg>
  );
}

export function LeafIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16z" />
      <path d="M8 17c2-4 5-6 9-7" />
    </svg>
  );
}

export const MODE_COLOR: Record<Mode, string> = {
  metro: "text-brand",
  rail: "text-indigo-500",
  bus: "text-teal",
  walk: "text-slate-500",
  auto: "text-amber-500",
};

export const MODE_LABEL: Record<Mode, string> = {
  metro: "Metro",
  rail: "Rail",
  bus: "Bus",
  walk: "Walk",
  auto: "Auto",
};
