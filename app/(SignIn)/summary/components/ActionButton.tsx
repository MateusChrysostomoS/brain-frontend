// ActionButton — pill button for the patient summary actions
// (mark attended / reject / copy). `variant` drives the colour treatment;
// an optional leading icon sits before the label.

import type { ReactNode } from "react";

type ActionButtonProps = {
  variant: "primary" | "danger" | "ghost";
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export default function ActionButton({
  variant,
  children,
  icon,
  onClick,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`btn-action ${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
}
