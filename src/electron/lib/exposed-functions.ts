import sharp = require("sharp");
import * as Fs from "fs";
import logger from "../utils/logger";
import { IEditPhoto } from "./interfaces";
import { app } from "electron";
import { join } from "path";

// import path from "path";

export class Edit {
  public async editPhoto(data: IEditPhoto, filePath: string) {
    if (!filePath) return;

    const image = sharp(filePath);
    image.modulate({
      brightness: data.brightness !== undefined ? data.brightness : 1,
      saturation: data.saturation !== undefined ? data.saturation : 1,
      hue: data.hue !== undefined ? data.hue : 1,
    });
    image.rotate(data.rotate !== undefined ? data.rotate : 0, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    const imagePath = join(app.getPath("userData"), "temp/edited-image.png");

    // image.linear(data.shadow !== undefined ? data.shadow : 1, 2);
    await image.toFile(imagePath).catch(() => logger.info("Error"));
    return Fs.readFileSync(imagePath).toString("base64");
  }
}
