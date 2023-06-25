import { dialog, ipcMain, BrowserWindow } from "electron";

type QueryInterface = {
  interfaceId: string;
  queries: { [key: string]: () => void };
  subscriptions: { [key: string]: () => void };
};

// Handles IPC calls from the frontend
export default class Handlers {
  constructor(private mainWindow: BrowserWindow) {
    const queryInterface: QueryInterface[] = [
      {
        interfaceId: "commandRegistry",
        queries: {
          getCommands: () => {
            return;
          },
          addCommands: () => {
            return;
          },
          runCommand: () => {
            return;
          },
        },
        subscriptions: {
          registryChanged: () => {
            return;
          },
        },
      },
      {
        interfaceId: "tileRegistry",
        queries: {
          getTiles: () => {
            return;
          },
        },
        subscriptions: {
          registryChanged: () => {
            return;
          },
        },
      },
      {
        interfaceId: "toolboxRegistry",
        queries: {
          getNodes: () => {
            return;
          },
        },
        subscriptions: {
          registryChanged: () => {
            return;
          },
        },
      },
    ];

    for (const iface of queryInterface) {
      // Deploy handlers for each query
      for (const query in iface.queries) {
        if (!iface.queries.hasOwnProperty(query)) continue;

        ipcMain.handle(`${iface.interfaceId}/${query}`, iface.queries[query]);
      }

      // Deploy listeners for each subscription
      for (const subscription in iface.subscriptions) {
        if (!iface.subscriptions.hasOwnProperty(subscription)) continue;

        // If a query and a subscription have the same name,
        // the query will take precedence
        if (subscription in iface.queries) continue;

        ipcMain.on(`${iface.interfaceId}/${subscription}`, iface.subscriptions[subscription]);
      }
    }
  }
}
