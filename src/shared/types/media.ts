import { type UUID } from "../../shared/utils/UniqueEntity";

export type MediaOutputId = string;

export interface MediaOutput {
  outputId: MediaOutputId;
  outputNodeUUID: UUID;
  content: any;
  dataType: string;
}
