import { MainApis } from "./electron/lib/api/MainApi";

declare global {
  let mainApis: MainApis;
}
