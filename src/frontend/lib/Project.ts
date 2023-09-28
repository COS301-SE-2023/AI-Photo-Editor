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

/**
 * Constructs a PanelGroup from a LayoutPanel
 * @param layout The layout to construct from
 * @returns The constructed PanelGroup
 */
const defaultSize = 0;
export function constructLayout(layout: LayoutPanel, splits: number[]): PanelGroup {
  const group = new PanelGroup(
    (groupTest++).toString(),
    undefined,
    "split" in layout ? layout.split[0] : defaultSize
  );
  if ("panels" in layout) {
    for (let i = 0; i < layout.panels.length; ++i) {
      const panel = layout.panels[i];
      if ("panels" in panel) {
        group.addPanelGroup(constructLayout(panel, panel.split.slice(1)), panel.panels.length);
      } else {
        if ("content" in panel) {
          group.addPanel(panel.content, layout.panels.length, splits[i]);
        }
      }
    }
    return group;
  }
  return group;
}

/**
 * A layout template for the UI
 */
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
      split: [50, 50, 50],
    },
    {
      content: "graph",
    },
  ],
  split: [50, 50],
};
