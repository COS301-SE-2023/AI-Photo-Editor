import { MainApis } from "./electron/lib/api/mainApi";

declare global {
  let mainApis: MainApis;
}
