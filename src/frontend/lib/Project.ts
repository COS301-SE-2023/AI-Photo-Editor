import type { UUID } from "../../shared/utils/UniqueEntity";
import { PanelGroup } from "./PanelNode";
import type { LayoutPanel } from "../../shared/types/index";

export interface UIProject {
  readonly id: UUID;
  readonly name: string;
  readonly saved: boolean;
  readonly layout: PanelGroup;
  readonly graphs: UUID[];
}

let groupTest = 0;

export function constructLayout(layout: LayoutPanel): PanelGroup {
  const group = new PanelGroup((groupTest++).toString());
  if (layout.panels) {
    for (const panel of layout.panels) {
      if (panel.panels) {
        group.addPanelGroup(constructLayout(panel), panel.panels.length);
      } else {
        if (panel.content) {
          group.addPanel(panel.content, layout.panels.length);
        }
      }
    }
    return group;
  }
  return group;
}

export const layoutTemplate: LayoutPanel = {
  panels: [
    {
      content: "assets",
    },
    {
      content: "graph",
    },
  ],
};
