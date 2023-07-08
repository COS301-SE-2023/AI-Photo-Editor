import type { UUID } from "@shared/utils/UniqueEntity";
import type { panel } from "./layout";

export interface projectSchema {
    id: UUID;
    name: string;
    layout: panel;
}