import type { BrowserWindow } from "electron";
import type { AwaitedType } from "electron-affinity/main";
import { bindWindowApi } from "electron-affinity/main";

// Window APIs
import type { ToolboxClientApi } from "@frontend/lib/api/apis/ToolboxClientApi";
import type { CommandClientApi } from "@frontend/lib/api/apis/CommandClientApi";
import type { GraphClientApi } from "@frontend/lib/api/apis/GraphClientApi";
import type { ProjectClientApi } from "@frontend/lib/api/apis/ProjectClientApi";
import type { UtilClientApi } from "@frontend/lib/api/apis/UtilClientApi";
import type { MediaClientApi } from "@frontend/lib/api/apis/MediaClientApi";
import type { TileClientApi } from "@frontend/lib/api/apis/TileClientApi";

/**
 * Binds the window APIs to the main process for every window.
 *
 * When creating a new window API add it to this method.
 *
 * @param window The the window to bind the APIs to
 */
export async function bindMainWindowApis(window: BrowserWindow) {
  return Object.assign(window, {
    apis: {
      commandClientApi: await bindWindowApi<CommandClientApi>(window, "CommandClientApi"),
      toolboxClientApi: await bindWindowApi<ToolboxClientApi>(window, "ToolboxClientApi"),
      graphClientApi: await bindWindowApi<GraphClientApi>(window, "GraphClientApi"),
      projectClientApi: await bindWindowApi<ProjectClientApi>(window, "ProjectClientApi"),
      utilClientApi: await bindWindowApi<UtilClientApi>(window, "UtilClientApi"),
      mediaClientApi: await bindWindowApi<MediaClientApi>(window, "MediaClientApi"),
      tileClientApi: await bindWindowApi<TileClientApi>(window, "TileClientApi"),
    },
  });
}

export type MainWindow = AwaitedType<typeof bindMainWindowApis>;
