import exp from "constants";
import { PanelGroup, PanelLeaf, PanelNode, focusedPanelStore } from "../../../src/frontend/lib/PanelNode";
import { Pane } from "svelte-splitpanes";
import { exportMedia } from "../../../src/electron/lib/projects/ProjectCommands";
import { LayoutPanel } from "../../../src/shared/types";
import { constructLayout } from "../../../src/frontend/lib/Project";




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

      panelNode.addPanel("media",69);
      expect(panelNode.panels.length).toBe(2);
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

      const len = panelNode.panels.length;
      panelNode.removePanel(69);
      expect(panelNode.panels.length).toBe(len);

    }
    )

    test("Setting panels", () => {
      panelNode.addPanel("media",0);


      const curr = panelNode.getPanel(0);

      const node = new PanelLeaf("graph");


      panelNode.setPanel(node,69);

      expect(panelNode.panels.length).toBe(1);
      expect(panelNode.panels[0]).toBe(curr);
      panelNode.setPanel(node,0);

      expect(panelNode.panels.length).toBe(1);
      expect(panelNode.panels[0]).toBe(node);
      expect(panelNode.panels[0].id).toBe(curr.id);
    })

    test("Printing a panel group", () => {
      panelNode.addPanel("media",0);
      panelNode.addPanel("media",1);
      panelNode.addPanel("media",2);

      expect(panelNode.print()).toBe("Unique id[NULL](-1)\n" + "+ media[Unique id](0)\n"  + "+ media[Unique id](1)\n"  + "+ media[Unique id](2)\n")
      const panelGroup1 = new PanelGroup("Unique id");
      panelGroup1.addPanelGroup(panelNode,0);

      
      expect(panelGroup1.print()).toBe("Unique id[NULL](-1)\n" + "- Unique id[Unique id](0)\n" + "  + media[Unique id](0)\n"  + "  + media[Unique id](1)\n"  + "  + media[Unique id](2)\n")
      panelNode.panels[1].parent = null;
      expect(panelNode.print()).toBe("Unique id[Unique id](0)\n" + "+ media[Unique id](0)\n"  + "+ media[NULL](1)\n"  + "+ media[Unique id](2)\n")
    })

    test("Testing Recurse Parent", () => {
      panelNode.addPanel("media",0);
      panelNode.addPanel("media",1);
      panelNode.addPanel("media",2);

      const panelGroup = new PanelGroup("Unique id");
      panelGroup.addPanel("media",0);

      panelNode.addPanelGroup(panelGroup,3);

      panelNode.panels[1].parent=null;
      panelNode.recurseParent();

      expect(panelNode.panels[1].parent).toBe(panelNode);

    })


    test("Testing save layout", () => {
      panelNode.addPanel("media",0);
      panelNode.addPanel("media",1);
      panelNode.addPanel("media",2);

      const panelGroup = new PanelGroup("Unique id");
      panelGroup.addPanel("media",0);

      panelNode.addPanelGroup(panelGroup,3);

      const layout : LayoutPanel = {
        panels: [
          {
            content: "media",
          },
          {
            content: "media",
          },
          {
            content: "media",
          },
          {
            panels: [
              {
                content: "media",
              },
            ]
          }
        ]
      }
      expect(panelNode.saveLayout()).toEqual(layout);
    })

    test("Testing focusedPanelStore", () => {
      focusedPanelStore.focusOnPanel(1);
      focusedPanelStore.focusOnPanel(2);
      focusedPanelStore.focusOnPanel(3);

      expect(focusedPanelStore.subscribe).toReturn;

    })
    
});

describe("Test project.ts", () => {

  let panelNode : PanelGroup;
  beforeEach(() => {
    PanelGroup.groupCounter = 0;
    PanelNode.panelCounter = 0;
    panelNode = new PanelGroup("Unique id");
  });
  test ("Testing constructLayout", () => {
    panelNode.addPanel("media",0);
    panelNode.addPanel("media",1);
    panelNode.addPanel("media",2);

    const panelGroup = new PanelGroup("Unique id");
    panelGroup.addPanel("media",0);

    panelNode.addPanelGroup(panelGroup,3);

    const layout : LayoutPanel = {
      panels: [
        {
          content: "media",
        },
        {
          content: "media",
        },
        {
          content: "media",
        },
        {
          panels: [
            {
              content: "media",
            },
          ]
        }
      ]
    }

    const group = constructLayout(layout);
    expect(group.panels.length).toEqual(panelNode.panels.length);
  })
})