import { type UUID } from "../../shared/utils/UniqueEntity";

export type MediaOutputId = string;

export interface MediaOutput {
  outputId: MediaOutputId;
  outputNodeUUID: UUID;
  graphUUID: UUID;
  content: any;
  dataType: string;
}

// MediaOutput that has been pre-processed for display in the Media tile
export type DisplayableMediaOutput = MediaOutput & { display: MediaDisplayConfig };

export interface MediaDisplayConfig {
  displayType: MediaDisplayType; // Type of svelte display component to use
  props: { [key: string]: any }; // Props passed to the Svelte display component
  contentProp: string | null; // Name of the prop that should be filled with the content when displaying
}

export enum MediaDisplayType {
  Image = "Image",
  TextBox = "TextBox",
  ColorDisplay = "ColorDisplay",
  Webview = "Webview",
}
