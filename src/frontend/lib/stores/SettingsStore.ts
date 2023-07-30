import { writable } from "svelte/store";
interface SettingsStoreState {
  showing: boolean;
}

class SettingsStore {
  private readonly store = writable<SettingsStoreState>({ showing: false });

  public toggleSettings() {
    this.store.update((state) => {
      state.showing = !state.showing;
      return state;
    });
  }

  public hideSettings() {
    this.store.update((state) => {
      state.showing = false;
      return state;
    });
  }

  public showSettings() {
    this.store.update((state) => {
      state.showing = true;
      return state;
    });
  }

  public get subscribe() {
    return this.store.subscribe;
  }
}

export const settingsStore = new SettingsStore();
