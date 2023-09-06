import type { PaletteView } from "./palette";

export interface ICommand {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type CommandResponse<S = unknown, E = unknown> =
  | {
      status: "success";
      message?: string;
      data?: S;
    }
  | {
      status: "error";
      message: string;
      data?: E;
    }
  | {
      status: "palette";
      data: PaletteView;
    };
