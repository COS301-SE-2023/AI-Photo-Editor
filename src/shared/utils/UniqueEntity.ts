import { randomUUID } from "crypto";

export class UniqueEntity {
  private readonly _uuid: UUID = randomUUID();

  public get uuid() {
    return this._uuid;
  }
}

export type UUID = ReturnType<typeof randomUUID>;
