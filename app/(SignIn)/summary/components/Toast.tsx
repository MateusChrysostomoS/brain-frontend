// Toast — transient confirmation pill pinned to the bottom of the
// viewport. Purely presentational; visibility + copy come from useToast().

export type ToastTone = "success" | "info";

type ToastProps = {
  message: string;
  visible: boolean;
  tone?: ToastTone;
};

export default function Toast({ message, visible, tone = "success" }: ToastProps) {
  return (
    <div
      className={visible ? "toast show" : "toast"}
      role="status"
      aria-live="polite"
    >
      <span className="ok" aria-hidden="true">
        {tone === "success" ? "✓" : "●"}
      </span>
      {message}
    </div>
  );
}
