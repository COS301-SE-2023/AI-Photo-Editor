// Abstract representation of a backend registry
export interface Registry {
  addInstance(instance: RegistryInstance): void;
  getRegistry(): RegistryInstance[];
}

// Implementations of this interface should
// ideally be immutable
export interface RegistryInstance {
  get id(): string;
}
