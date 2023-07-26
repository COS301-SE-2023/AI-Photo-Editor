export enum QueryResponseStatus {
  "error" = 0,
  "success" = 1,
}

// Use whenever a query may return an error or success, along with some data
// E.g. Returned by a graph after a change
export interface QueryResponse {
  status: QueryResponseStatus;
  message?: string;
  data?: any;
}
