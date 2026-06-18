// useToast — drives the bottom-of-screen Toast. showToast(message, tone)
// reveals the pill and auto-dismisses it after a short delay; the pending
// timer is cleared on unmount so no state update fires after teardown.

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastTone } from "../components/Toast";

const VISIBLE_MS = 2600;

type ToastState = {
  message: string;
  tone: ToastTone;
  visible: boolean;
};

export function useToast() {
  const [state, setState] = useState<ToastState>({
    message: "",
    tone: "success",
    visible: false,
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    setState({ message, tone, visible: true });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => setState((s) => ({ ...s, visible: false })),
      VISIBLE_MS,
    );
  }, []);

  // Clear any pending hide timer when the consumer unmounts.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { ...state, showToast };
}
