import { writable } from "svelte/store";

export interface ToastOptions {
  message: string;
  type: "success" | "error" | "info" | "warn";
  autohide: boolean;
  timeout: number;
  freezable: boolean;
}

export interface Toast extends ToastOptions {
  id: string;
  timeoutId?: ReturnType<typeof setTimeout>;
}

const defaults: ToastOptions = {
  message: "Missing toast message",
  type: "info",
  autohide: true,
  timeout: 3000,
  freezable: true,
};

/** Generate random id to differentiate toasts. */
function randomUUID(): string {
  const random = Math.random();
  return Number(random).toString(32);
}

/** Sets timeout to autohide toast. */
function handleAutoHide(toast: Toast) {
  if (toast.autohide === true) {
    return setTimeout(() => {
      toastStore.dismiss(toast.id);
    }, toast.timeout);
  }
  return undefined;
}

function createToastStore() {
  const { subscribe, update, set } = writable<Toast[]>([]);

  /** Add a new toast to the queue. */
  function trigger(options: Partial<ToastOptions>) {
    const id = randomUUID();
    const toast: Toast = { id, ...defaults, ...options };
    toast.timeoutId = handleAutoHide(toast);
    update((toasts) => [...toasts, toast]);
  }

  /** Remove a toast from the queue. */
  function dismiss(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /** Keep toast visible on hover. */
  function freeze(id: string) {
    update((toasts) => {
      const toast = toasts.find((t) => t.id === id);
      if (toast && toast.freezable) {
        clearTimeout(toast.timeoutId);
      }
      return toasts;
    });
  }

  /** Disable remain visible on leave. */
  function unfreeze(id: string) {
    update((toasts) => {
      const toast = toasts.find((t) => t.id === id);
      if (toast && toast.freezable) {
        toast.timeoutId = handleAutoHide(toast);
      }
      return toasts;
    });
  }

  /** Remove all toasts from queue. */
  function clear() {
    set([]);
  }

  return {
    subscribe,
    trigger,
    dismiss,
    freeze,
    unfreeze,
    clear,
  };
}

export const toastStore = createToastStore();
