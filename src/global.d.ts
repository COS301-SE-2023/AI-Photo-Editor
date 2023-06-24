import type { MainApis } from "./frontend/init";

declare global {
  interface Window {
    apis: MainApis;
  }
}
