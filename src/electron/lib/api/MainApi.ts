import { exposeMainApi } from "electron-affinity/main";
import type { Blix } from "../Blix";

import { UtilApi } from "./UtilApi";
import { ProjectApi } from "./ProjectApi";
import { PluginApi } from "./PluginApi";
import { ToolboxApi } from "./ToolboxApi";

/**
 * Expose all main process APIs to the renderer. This method will be called on
 * app startup. These APIs are used for two-way communication from the renderer
 * to the main process using invoke/handle channels.
 *
 * When creating a new main process API add it to this method.
 *
 * @param blix The application state
 */
export function exposeMainApis(blix: Blix) {
  const apis = {
    utilApi: new UtilApi(),
    projectApi: new ProjectApi(blix),
    pluginApi: new PluginApi(blix),
    toolboxApi: new ToolboxApi(blix),
  };

  for (const api of Object.values(apis)) {
    exposeMainApi(api as any);
  }

  // @ts-ignore: no-var-requires
  global.mainApis = apis as any;
}

export type MainApis = ReturnType<typeof exposeMainApis>;
