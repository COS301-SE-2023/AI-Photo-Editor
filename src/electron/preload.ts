import { contextBridge, ipcRenderer } from "electron";

type Api = { [key: string]: QueryInterface };

type QueryInterface = (query: string, args: any, callback: (result: any) => void) => void;

type QueryInterfaceConfig = {
  interfaceId: string;
  queries: string[];
  subscriptions: string[];
};

// Constructs a lambda function that uses IPC to enable backend/frontend comms.
// `queries[]` are for performing operations / specific one-time requests
// `subscriptions[]` are for obtaining reactive callbacks on backend events
function constructQueryInterface(
  interfaceId: string,
  queries: string[],
  subscriptions: string[]
): QueryInterface {
  if (interfaceId.includes("/")) {
    throw new Error(`Interface '${interfaceId}' cannot contain '/'`);
  }

  return (query: string, args: any, callback: (result: any) => void) => {
    const queryId = `${interfaceId}/${query}`;
    if (queries.includes(query)) {
      ipcRenderer.invoke(queryId, args).then(callback);
    } else if (subscriptions.includes(query)) {
      ipcRenderer.on(queryId, (_, args) => callback(args));
    }
  };
}

// Construct api
//  `queries[]` and `subscriptions[]` should be mutually disjoint
const queryInterfaceConfigs: QueryInterfaceConfig[] = [
  {
    interfaceId: "commandRegistry",
    queries: [
      "getCommands", // Return a list of all current commands
      "addCommands", // Add a custom command to the registry
      "runCommand", // Run a command from the registry
    ],
    subscriptions: [
      "registryChanged", // Triggers when a command is added/removed/modified
    ],
  },
  {
    interfaceId: "tileRegistry",
    queries: ["getTiles"],
    subscriptions: ["registryChanged"],
  },
  {
    interfaceId: "toolboxRegistry",
    queries: ["getNodes"],
    subscriptions: ["registryChanged"],
  },
];

const api: Api = {};

for (const iface of queryInterfaceConfigs) {
  api[iface.interfaceId] = constructQueryInterface(
    iface.interfaceId,
    iface.queries,
    iface.subscriptions
  );
}

contextBridge.exposeInMainWorld("api", api);

export { api };
