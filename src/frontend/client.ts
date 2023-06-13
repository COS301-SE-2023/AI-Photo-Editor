import { bindMainApi } from "electron-affinity/window";
import type { AwaitedType } from "electron-affinity/window";

import type { UtilApi } from "../electron/lib/api/UtilApi";

export type MainApis = AwaitedType<typeof bindMainApis>;

export async function bindMainApis() {
  return {
    utilApi: await bindMainApi<UtilApi>("UtilApi"),
  };
}
