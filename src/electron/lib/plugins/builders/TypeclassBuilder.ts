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

/**
 * Builder class for creating Typeclasses through Builder pattern
 */
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

  /**
   * Sets the description of the partial typeclass
   * @param description
   */
  setDescription(description: string) {
    this.partial.description = description;
  }

  /**
   * Sets the From converters of the partial typeclass
   * @param converters
   */
  setFromConverters(converters: { [key: string]: (fromType: string) => any }) {
    Object.keys(converters).forEach((fromTypeId) => {
      this.partial.fromConverters.push([fromTypeId, converters[fromTypeId]]);
    });
  }

  /**
   * Set the To converters of the partial typeclass
   * @param converters
   */
  setToConverters(converters: { [key: string]: (toType: string) => any }) {
    Object.keys(converters).forEach((toTypeId) => {
      this.partial.toConverters.push([toTypeId, converters[toTypeId]]);
    });
  }

  /**
   * Set the mediaDisplayConfigurator of the partial typeclass
   * @param configurator
   */
  setDisplayConfigurator(configurator: (data: string) => MediaDisplayConfig) {
    this.partial.mediaDisplayConfigurator = configurator;
  }

  /**
   * Returns the current build of the partial typeclass
   */
  private get buildTypeclass(): Typeclass {
    return {
      id: this.partial.id,
      description: this.partial.description,
      subtypes: this.partial.subtypes,
      mediaDisplayConfig: this.partial.mediaDisplayConfigurator,
    };
  }

  /**
   * Returns the from and to converters of the current partial typeclass
   * @returns List of converter Triples
   */
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

  /**
   * @returns the current build of the partial typeclass and its converters
   */
  get build(): [Typeclass, ConverterTriple[]] {
    return [this.buildTypeclass, this.buildConverters];
  }
}
