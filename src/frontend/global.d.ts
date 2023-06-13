import type { MainApis } from "./client";

declare global {
  interface Window {
    apis: MainApis;
  }
}
