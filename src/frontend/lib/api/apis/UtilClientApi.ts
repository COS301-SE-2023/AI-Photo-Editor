import type { ElectronWindowApi } from "electron-affinity/window";
import { toastStore, type ToastOptions } from "../../stores/ToastStore";

export class UtilClientApi implements ElectronWindowApi<UtilClientApi> {
  showToast(options: Partial<ToastOptions>) {
    toastStore.trigger(options);
  }
}
