import type { UUID } from "./Graph";
//
// Implement this interface to communicate with a CoreGraph instance
export interface CoreGraphSubscriber {
  connectedGraph: UUID;
  subscribe(coreGraph: UUID): void;
  unsubscribe(): void;
  getGraphRepresentation(): any;
}
