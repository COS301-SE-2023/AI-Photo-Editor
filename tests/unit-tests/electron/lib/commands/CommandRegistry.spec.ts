import exp from "constants";
import { CommandRegistry,type CommandHandler, Command } from "../../../../../src/electron/lib/registries/CommandRegistry"
import { Blix } from "../../../../../src/electron/lib/Blix";
import { MainWindow } from "../../../../../src/electron/lib/api/apis/WindowApi";
import { ICommand } from "../../../../../src/shared/types/command";


const mainWindow: MainWindow = {
  apis: {
    commandRegistryApi: jest.fn(),
    clientGraphApi: jest.fn(),
    clientProjectApi: jest.fn(),
    toolboxClientApi: {
      registryChanged: jest.fn(),
    },
    commandClientApi: {
      registryChanged: jest.fn(),
    }
    
  }
} as any;

jest.mock("chokidar", () => ({
  default: {
    watch: jest.fn(() => {
      return {
        on: jest.fn()
      }
    }),
  }
}));

jest.mock("electron", () => ({
  app: {
    getPath: jest.fn((path) => {
      return "test/electron";
    }),
    getName: jest.fn(() => {
      return "TestElectron";
    }),
    getVersion: jest.fn(() => {
      return "v1.1.1";
    }),
    getAppPath: jest.fn(() => {
      return "test/electron";
    })
  },
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));


describe("Test CommandRegistry", () => {


  let blix : Blix;

  describe("Test CommandRegistry", () => {
    let commandRegistry: CommandRegistry;
    let command: Command;
    let description: any;


    beforeEach(() => {
      blix = new Blix();
      blix.init(mainWindow);

      commandRegistry = new CommandRegistry(blix);
       description = {
        name: "name",
        displayName: "displayName",
        description: "description",        
      }
       command = {
        id: "plugin.name",
        handler : () => {console.log(1)},
        description: description,
      }
    });

    test("Test constructor", () => {
      expect(commandRegistry).toBeDefined();
    })


    test("Test addInstance", () => {
      //Add command to registry
      command.handler = () => {return 1};
      commandRegistry.addInstance(command);
      expect(commandRegistry.getRegistry()[command.id].id).toBe("plugin.name");
      expect(commandRegistry.getRegistry()[command.id].description).toBe(description);
      expect(commandRegistry.getRegistry()[command.id].handler(blix,"")).toBe(1);

      const dummy = null;

      expect(() => commandRegistry.addInstance(dummy!)).toThrow("Invalid Command");

    });

    test("Test getCommands", () => {
      const command2 = {
        id: "plugin1.name1",
        handler : () => {return 2},
        description: description,
      }

      commandRegistry.addInstance(command);
      commandRegistry.addInstance(command2);

      const commands: ICommand[] = commandRegistry.getCommands();
      expect(commands.length).toBe(2);
      expect(commands[0].id).toBe("plugin.name");
      expect(commands[1].id).toBe("plugin1.name1");
    })

    test("Test runCommand",async () => {
      console.log = jest.fn();
      const command2 = {
        id: "plugin1.name1",
        handler : () => {console.log(2)},
        description: description,
      }

      commandRegistry.addInstance(command);
      commandRegistry.addInstance(command2);

      commandRegistry.runCommand("plugin.name")
      expect(console.log).toBeCalledWith(1);

      commandRegistry.runCommand("plugin1.name1")
      expect(console.log).toBeCalledTimes(2);

      const id = "bing chilling"

      await expect(commandRegistry.runCommand(id)).rejects.toThrowError('Invalid Command');
    })
  });
});