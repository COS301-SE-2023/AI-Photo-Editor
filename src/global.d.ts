import type { MainApis } from "./frontend/lib/api/apiInitializer";

declare global {
  interface Window {
    apis: MainApis;
  }

  // Use whenever a query may return an error or success, along with some data
  // E.g. Returned by a graph after a change
  export interface QueryResponse {
    status: "error" | "success";
    message?: string;
    data?: any;
  }
}
