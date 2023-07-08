import exp from "constants";
import { CommandInstance, CommandRegistry } from "../../../../../src/electron/lib/registries/CommandRegistry"
import { ICommand } from "../../../../../src/shared/ui/ToolboxTypes";


describe("Test CommandRegistry", () => {

  describe ("Test CommandInstance", () => {
    let command: CommandInstance;

    beforeEach(() => {
      command = new CommandInstance("plugin","name","displayName","description","icon",() => {console.log(1)});
    });

    test("Test constructor", () => {
      expect(command).toBeDefined();
    })

    test("Test all getters", () => {
      expect(command.signature).toBe("plugin.name");
      expect(command.plugin).toBe("plugin");
      expect(command.name).toBe("name");
      expect(command.displayName).toBe("displayName");
      expect(command.description).toBe("description");
      expect(command.icon).toBe("icon");
      expect(command.id).toBe("");
    })

    test("Test run getter", () => {
      console.log = jest.fn();
      command.run();
      expect(console.log).toBeCalledWith(1);
    })


  })

  describe("Test CommandRegistry", () => {
    let commandRegistry: CommandRegistry;
    let command: CommandInstance;

    beforeEach(() => {
      commandRegistry = new CommandRegistry();
      command = new CommandInstance("plugin","name","displayName","description","icon",() => {console.log(1)});
    });

    test("Test constructor", () => {
      expect(commandRegistry).toBeDefined();
    })


    test("Test addInstance", () => {
      //Add command to registry
      commandRegistry.addInstance(command);
      expect(commandRegistry.getRegistry()[command.signature].plugin).toBe("plugin");
      expect(commandRegistry.getRegistry()[command.signature].name).toBe("name");
      expect(commandRegistry.getRegistry()[command.signature].displayName).toBe("displayName");
      expect(commandRegistry.getRegistry()[command.signature].description).toBe("description");
      expect(commandRegistry.getRegistry()[command.signature].icon).toBe("icon");
    });

    test("Test getCommandNames", () => {
      commandRegistry.addInstance(command)
      expect(commandRegistry.getCommandNames()[0]).toBe("plugin.name");
    })

    test("Test getCommands", () => {
      const command2 = new CommandInstance("plugin1","name1","displayName","description","icon",() => {console.log(2)});

      commandRegistry.addInstance(command);
      commandRegistry.addInstance(command2);

      const commands: ICommand[] = commandRegistry.getCommands();
      expect(commands.length).toBe(2);
      expect(commands[0].signature).toBe("plugin.name");
      expect(commands[1].signature).toBe("plugin1.name1");
    })

    test("Test runCommand", () => {
      console.log = jest.fn();
      const command2 = new CommandInstance("plugin1","name1","displayName","description","icon",() => {console.log(2)});

      commandRegistry.addInstance(command);
      commandRegistry.addInstance(command2);

      commandRegistry.runCommand("plugin.name")
      expect(console.log).toBeCalledWith(1);

      commandRegistry.runCommand("plugin1.name1")
      expect(console.log).toBeCalledTimes(2);
    })
  });
});