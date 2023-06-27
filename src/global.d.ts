import type { MainApis } from "./frontend/api/apiInitializer";

declare global {
  interface Window {
    apis: MainApis;
  }
}
