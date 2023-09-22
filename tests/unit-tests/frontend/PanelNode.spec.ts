import exp from "constants";
import { PanelGroup, PanelLeaf, PanelNode } from "../../../src/frontend/lib/PanelNode";
import { Pane } from "svelte-splitpanes";
import { exportMedia } from "../../../src/electron/lib/projects/ProjectCommands";




  describe("Test PanelGroup", () => {
    let panelNode : PanelGroup;

    beforeEach(() => {
      PanelGroup.groupCounter = 0;
      PanelNode.panelCounter = 0;
      panelNode = new PanelGroup("Unique id");

    });

    // This file only consists of constructors, so we only test those

    test("Test constructor", () => {
      expect(panelNode.id).toBe(0);
      expect(panelNode.panels).toEqual([]);
      expect(panelNode.parent).toBe(null);
      expect(panelNode.index).toBe(-1);

      panelNode = new PanelGroup("Hello",3);
      expect(panelNode.id).toBe(3);


      panelNode = new PanelGroup();
      expect(panelNode.name).toBe("pg_2")
    })

    test("Adding panels", () => {
      panelNode.addPanel("media",0);


      expect(panelNode.panels.length).toBe(1);
      expect(panelNode.panels[0].parent).toBe(panelNode);
      expect(panelNode.panels[0].index).toBe(0);
      expect(panelNode.panels[0].id).toBe(1);
    })

    test("Removing panels", () => {
      panelNode.addPanel("media",0);
      panelNode.addPanel("media",1);
      panelNode.addPanel("media",2);

      panelNode.removePanel(1);

      expect(panelNode.panels.length).toBe(2);
      expect(panelNode.panels[0].id).toBe(1);
      expect(panelNode.panels[1].id).toBe(3);

      const panelNode2 = new PanelGroup("Unique id");
      panelNode2.addPanelGroup(panelNode,0);
      panelNode.removePanel(0);

      expect(panelNode2.panels.length).toBe(1);
      expect(panelNode2.panels[0].id).toBe(0);
      expect(panelNode2.panels[0].parent).toBe(panelNode2);
      expect(panelNode2.panels[0].index).toBe(0);

      panelNode = new PanelGroup("Unique id");
      panelNode2.addPanelGroup(panelNode,0);
      panelNode.removePanel(0);
      expect(panelNode2.panels.length).toBe(1);
    }
    )

    test("Setting panels", () => {
      panelNode.addPanel("media",0);


      const curr = panelNode.getPanel(0);

      const node = new PanelLeaf("graph");

      panelNode.setPanel(node,0);

      expect(panelNode.panels.length).toBe(1);
      expect(panelNode.panels[0]).toBe(node);
      expect(panelNode.panels[0].id).toBe(curr.id);

    })

  });