import type { MainApis } from "./frontend/lib/api/apiInitializer";

declare global {
  interface Window {
    apis: MainApis;
  }
}
