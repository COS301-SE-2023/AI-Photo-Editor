import type { ElectronWindowApi } from "electron-affinity/window";
import { toastStore, type ToastOptions } from "../../stores/ToastStore";
import { blixStore, setInitialStores, type BlixStoreState } from "../../../lib/stores/BlixStore";
import { bindMainApis } from "../apiInitializer";

export class UtilClientApi implements ElectronWindowApi<UtilClientApi> {
  showToast(options: Partial<ToastOptions>) {
    toastStore.trigger(options);
  }

  /**
   * Will be called when Blix first initializes and when window is reloaded.
   */
  async onBlixReady() {
    if (!window.apis) {
      window.apis = await bindMainApis();
    }
    await setInitialStores();
    blixStore.update((state) => ({ ...state, blixReady: true }));
  }

  refreshBlixStore(data: Partial<BlixStoreState>) {
    blixStore.refreshStore(data);
  }
}
