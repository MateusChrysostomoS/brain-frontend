// icons.tsx — SVG icon set for the patient summary route.
// All icons are decorative (aria-hidden) and sized via the `size` prop;
// they inherit colour from the parent through `currentColor`.

import type { ReactNode } from "react";

type IconProps = { size?: number };

// Shared stroke-icon frame — keeps every icon on the same 24x24 grid.
function Stroke({
  size = 16,
  width = 2,
  children,
}: IconProps & { width?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ChevronLeftIcon({ size }: IconProps) {
  return (
    <Stroke size={size} width={2}>
      <polyline points="15 18 9 12 15 6" />
    </Stroke>
  );
}

export function CheckIcon({ size }: IconProps) {
  return (
    <Stroke size={size} width={2.2}>
      <polyline points="20 6 9 17 4 12" />
    </Stroke>
  );
}

export function XIcon({ size }: IconProps) {
  return (
    <Stroke size={size} width={2.2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Stroke>
  );
}

export function CopyIcon({ size }: IconProps) {
  return (
    <Stroke size={size} width={1.9}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Stroke>
  );
}

export function AlertTriangleIcon({ size }: IconProps) {
  return (
    <Stroke size={size} width={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Stroke>
  );
}

export function CheckCircleIcon({ size }: IconProps) {
  return (
    <Stroke size={size} width={2}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </Stroke>
  );
}

export function AlertCircleIcon({ size }: IconProps) {
  return (
    <Stroke size={size} width={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </Stroke>
  );
}
