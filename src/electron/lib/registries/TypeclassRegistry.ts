import type { Registry } from "./Registry";
import type { ICommand } from "../../../shared/types";
import { Blix } from "../Blix";

export type TypeclassId = string;
export type TypeConverter = (value: any) => any;

export interface Typeclass {
  id: TypeclassId;
  description: string | null;
  subtypes: TypeclassId[];
}

// Maximum depth through which we'll traverse the
// type conversion graph when checking if types are compatible
const MAX_SEARCH_DEPTH = 2;

// Pixi <image>
// number[]
// string

export class TypeclassRegistry implements Registry {
  // The set of all typeclasses allowed in Blix
  private typeclasses: { [key: TypeclassId]: Typeclass } = {};
  // Implicit conversion functions between typeclasses
  private converters: { [key: TypeclassId]: { [key: TypeclassId]: TypeConverter } } = {};

  constructor(private readonly blix: Blix) {
    // Add default Blix types
    this.addInstance({
      id: "",
      description: "The `any` type, into which all other types can fit",
      subtypes: [],
    });
    this.addInstance({
      id: "number",
      description: "A simple integer or floating point number",
      subtypes: [],
    });
    this.addInstance({ id: "string", description: "A string of characters", subtypes: [] });
    this.addInstance({ id: "bool", description: "A true/false value", subtypes: [] });
    this.addInstance({ id: "color", description: "An RGBA hex value", subtypes: [] });
    this.addInstance({ id: "image", description: "A 2D array of RGBA pixel values", subtypes: [] });
    this.addInstance({
      id: "error",
      description: "An object representing an error state during graph computation",
      subtypes: [],
    });

    // Add default converters
    this.addConverter("number", "string", (value: number) => value.toString());
    this.addConverter("string", "number", (value: string) => parseFloat(value));
    this.addConverter("bool", "string", (value: boolean) => (value ? "true" : "false"));
    this.addConverter("string", "bool", (value: string) => value.toLowerCase() === "true");
    this.addConverter("number", "bool", (value: number) => value !== 0);
  }

  addInstance(instance: Typeclass): void {
    if (!instance) {
      throw Error("Invalid Typeclass");
    }
    if (this.typeclasses[instance.id]) {
      throw Error(`Typeclass ${instance.id} already exists`);
    }
    this.typeclasses[instance.id] = instance;
    this.blix.mainWindow?.apis.commandClientApi.registryChanged(this.getTypeclasses());
  }

  getRegistry() {
    return { ...this.typeclasses };
  }

  addConverter(from: TypeclassId, to: TypeclassId, converter: TypeConverter): void {
    if (!this.converters[from]) {
      this.converters[from] = {};
    }
    this.converters[from][to] = converter;
  }

  // Returns a composite converter from `from` to `to`
  resolveConversion(from: TypeclassId, to: TypeclassId, depth?: number): TypeConverter | null {
    depth = depth ?? MAX_SEARCH_DEPTH;
    if (depth <= 0) return null;

    const fromConverters = this.converters[from];
    if (!fromConverters) return null;

    // Direct converter found
    if (fromConverters[to]) return fromConverters[to];

    // NOTE: This uses depth-first search, which is fine for small depths,
    //       but may be slow for large depths later on
    for (const localTo of Object.keys(fromConverters)) {
      const res = this.resolveConversion(localTo, to, depth - 1);

      // Converter path found
      if (res !== null) {
        const direct = fromConverters[localTo];
        return (value: any) => res(direct(value));
      }
    }

    return null;
  }

  // Returns true if the `from` type is compatible with the `to` type
  checkTypesCompatible(from: TypeclassId, to: TypeclassId): boolean {
    // Handle base cases
    if (from === to || from === "" || to === "") return true;

    // Check for possible implicit conversions
    const res = this.resolveConversion(from, to) !== null;
    return res;
  }

  getTypeclasses(): ICommand[] {
    const commands: ICommand[] = [];
    // for (const key in this.registry) {
    //   if (key in this.registry) {
    //     const command = this.registry[key];
    //     const commandObject: ICommand = { /* TODO */ };
    //     commands.push(commandObject);
    //   }
    // }
    return commands;
  }
}