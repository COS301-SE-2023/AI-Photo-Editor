// import crypto from "crypto";
// const crypto = require("crypto");

export type UUID = string;

export class UniqueEntity {
  readonly _uuid: UUID;

  constructor() {
    this._uuid = UniqueEntity.genUUID();
  }

  public get uuid() {
    return this._uuid;
  }

  // 64-bit hex string (length 32 chars)
  private static genUUID(): UUID {
    // 1% chance of collision after 83 million years at 1 hash/ms 🫨
    // TODO: Move require() somewhere else so it doesn't get called every time
    //       For now this breaks with Jest so I guess we'll just have to put up with it.
    return require("crypto").randomBytes(32).toString("hex");
  }
}
