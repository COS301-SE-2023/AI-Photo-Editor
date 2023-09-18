import type {
  TypeConverter,
  Typeclass,
  TypeclassId,
  ConverterTriple,
} from "../../registries/TypeclassRegistry";
import { type MediaDisplayConfig, MediaDisplayType } from "../../../../shared/types/media";
import { type PluginContextBuilder } from "./PluginContextBuilder";
import { type PathLike } from "fs";

type PartialTypeclass = {
  id: TypeclassId;
  description: string;
  subtypes: string[];
  renderer: PathLike;
  mediaDisplayConfigurator: (data: string) => MediaDisplayConfig;
  fromConverters: [TypeclassId, TypeConverter][];
  toConverters: [TypeclassId, TypeConverter][];
};

export class TypeclassBuilder implements PluginContextBuilder {
  private partial: PartialTypeclass;

  constructor(plugin: string, id: TypeclassId) {
    this.partial = {
      id,
      description: "",
      subtypes: [],
      renderer: "",
      mediaDisplayConfigurator: (data: string) => ({
        displayType: MediaDisplayType.TextBox,
        props: { content: "Invalid typeclass: Media display not specified" },
        contentProp: null,
      }),
      fromConverters: [],
      toConverters: [],
    };
  }

  setDescription(description: string) {
    this.partial.description = description;
  }

  setFromConverters(converters: { [key: string]: (fromType: string) => any }) {
    Object.keys(converters).forEach((fromTypeId) => {
      this.partial.fromConverters.push([fromTypeId, converters[fromTypeId]]);
    });
  }

  setToConverters(converters: { [key: string]: (toType: string) => any }) {
    Object.keys(converters).forEach((toTypeId) => {
      this.partial.toConverters.push([toTypeId, converters[toTypeId]]);
    });
  }

  setDisplayConfigurator(configurator: (data: string) => MediaDisplayConfig) {
    this.partial.mediaDisplayConfigurator = configurator;
  }

  private get buildTypeclass(): Typeclass {
    return {
      id: this.partial.id,
      description: this.partial.description,
      subtypes: this.partial.subtypes,
      mediaDisplayConfig: this.partial.mediaDisplayConfigurator,
    };
  }

  private get buildConverters(): ConverterTriple[] {
    return [
      ...this.partial.fromConverters.map(
        ([fromTypeId, converter]) => [fromTypeId, this.partial.id, converter] as ConverterTriple
      ),
      ...this.partial.toConverters.map(
        ([toTypeId, converter]) => [this.partial.id, toTypeId, converter] as ConverterTriple
      ),
    ];
  }

  get build(): [Typeclass, ConverterTriple[]] {
    return [this.buildTypeclass, this.buildConverters];
  }
}
