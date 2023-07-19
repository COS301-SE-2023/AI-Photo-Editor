import type { ElectronWindowApi } from "electron-affinity/window";
import { toastStore, type ToastOptions } from "../../stores/ToastStore";
import { blixStore, setInitialStores } from "../../../lib/stores/BlixStore";

export class UtilClientApi implements ElectronWindowApi<UtilClientApi> {
  showToast(options: Partial<ToastOptions>) {
    toastStore.trigger(options);
  }

  async onBlixReady() {
    await setInitialStores();
    blixStore.update((state) => ({ ...state, blixReady: true }));
  }
}
