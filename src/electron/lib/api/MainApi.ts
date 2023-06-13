import { exposeMainApi } from "electron-affinity/main";

import type { Blix } from "../Blix";
import { UtilApi } from "./UtilApi";

export type MainApis = ReturnType<typeof exposeMainApis>;

/**
 * This method is used to expose all main process APIs to the renderer and will
 * be called on app startup. These APIs are used for two-way communication from
 * the renderer to the main process using invoke/handle channels.
 *
 * @param blix
 */
export function exposeMainApis(blix: Blix) {
  const apis = {
    utilApi: new UtilApi(),
  };

  for (const api of Object.values(apis)) {
    exposeMainApi(api as any);
  }

  // @ts-ignore: no-var-requires
  global.mainApis = apis as any;
}
