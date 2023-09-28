import type { UUID } from "../utils/UniqueEntity";
import type { LayoutPanel } from "./layout";

export interface SharedProject {
  id: UUID;
  saved?: boolean;
  name?: string;
  layout?: LayoutPanel;
  graphs?: UUID[];
}

export interface recentProject {
  path: string;
  lastEdited: string;
}
