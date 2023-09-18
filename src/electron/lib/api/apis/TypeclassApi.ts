import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type TypeclassId } from "../../registries/TypeclassRegistry";
import { type RendererId } from "../../../../shared/types/typeclass";

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

  async getRendererSrc(id: RendererId) {
    return this.blix.typeclassRegistry.getRendererSrc(id);
  }
}
