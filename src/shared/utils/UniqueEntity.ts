import crypto from "crypto";

// export class UniqueEntity {
// private readonly _uuid: UUID = randomUUID();

//   public get uuid() {
//     return this._uuid;
//   }
// }

// export type UUID = ReturnType<typeof randomUUID>;

export type UUID = string;

export class UniqueEntity {
  private _uuid: UUID;

  constructor() {
    this._uuid = UniqueEntity.genUUID();
  }

  public get uuid() {
    return this._uuid;
  }

  // 64-bit hex string (length 32 chars)
  private static genUUID(): UUID {
    // 1% chance of collision after 83 million years at 1 hash/ms 🫨
    return crypto.randomBytes(32).toString("hex");
  }
}
