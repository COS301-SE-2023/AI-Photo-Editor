import type { UUID } from "../../shared/utils/UniqueEntity";
import { PanelGroup } from "./PanelNode";
import type { LayoutPanel } from "../../shared/types/index";
import type { Writable } from "svelte/store";
import type { GraphUUID } from "../../shared/ui/UIGraph";

export interface UIProject {
  readonly id: UUID;
  readonly name: string;
  readonly saved: boolean;
  readonly layout: PanelGroup;
  readonly graphs: UUID[];
  readonly focusedGraph: Writable<GraphUUID>;
  readonly focusedPanel: Writable<string>;
  readonly cache: UUID[];
}

let groupTest = 0;

/**
 * Constructs a PanelGroup from a LayoutPanel
 *
 * @param layout The layout to construct from
 * @returns The constructed PanelGroup
 */
export function constructLayout(layout: LayoutPanel): PanelGroup {
  const group = new PanelGroup((groupTest++).toString());

  layout.panels?.forEach((panel) => {
    if (panel.panels) {
      group.addPanelGroup(constructLayout(panel));
    } else {
      if (panel.content) {
        group.addPanel(panel.content);
      }
    }
  });

  return group;
}

export const layoutTemplate: LayoutPanel = {
  panels: [
    {
      panels: [
        {
          content: "media",
        },
        {
          content: "assets",
        },
      ],
    },
    {
      content: "graph",
    },
  ],
};
