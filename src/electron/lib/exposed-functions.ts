import sharp from "sharp"
import fs from "fs"
import logger from "../utils/logger";
import { IEditPhoto } from "./interfaces";
// import path from "path";


export class Edit{
	public async editPhoto(data: IEditPhoto) {
		const image = sharp("./assets/image.png")
		image.modulate({ brightness: data.brightness, 
			saturation: data.saturation, 
			hue: data.hue,
			
		 });
		image.rotate(data.rotate, {background: { r: 0, g: 0, b: 0, alpha: 0 }});
		image.linear(data.shadow.multiplier, data.shadow.offset);
		await image.toFile("./assets/edited-image.png").catch(() => logger.info("Error"))
		return fs.readFileSync("./assets/edited-image.png").toString('base64');
	}
}

