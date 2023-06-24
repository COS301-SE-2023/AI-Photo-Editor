// Defines the structure for a builder that can be used
// by a plugin to build a Blix internal object.
export interface PluginContextBuilder {
  get build(): any;
  // reset(): void;
}
