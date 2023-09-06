import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type TypeclassId } from "../../registries/TypeclassRegistry";

export class TypeclassApi implements ElectronMainApi<TypeclassApi> {
  private readonly blix: Blix;

  constructor(blix: Blix) {
    this.blix = blix;
  }

  async checkTypesCompatible(from: TypeclassId, to: TypeclassId) {
    return this.blix.typeclassRegistry.checkTypesCompatible(from, to);
  }

  async getTypeclasses() {
    return this.blix.typeclassRegistry.getTypeclasses();
  }
}
