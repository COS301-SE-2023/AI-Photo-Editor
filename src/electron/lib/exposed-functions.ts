import sharp from "sharp";
import fs from "fs";
import logger from "../utils/logger";
import { IEditPhoto } from "./interfaces";
// import path from "path";

export class Edit {
  public async editPhoto(data: IEditPhoto) {
    const image = sharp("./assets/image.png");
    image.modulate({
      brightness: data.brightness ? data.brightness : 1,
      saturation: data.saturation ? data.saturation : 1,
      hue: data.hue ? data.hue : 1,
    });
	image.rotate(data.rotate ? data.rotate : 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } });

    image.linear(data.shadow ? data.shadow : 1, 2);
    await image.toFile("./assets/edited-image.png").catch(() => logger.info("Error"));
    return fs.readFileSync("./assets/edited-image.png").toString("base64");
  }
}
