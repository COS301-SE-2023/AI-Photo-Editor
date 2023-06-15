import type { MainApis } from "./init";

declare global {
  interface Window {
    apis: MainApis;
  }
}
