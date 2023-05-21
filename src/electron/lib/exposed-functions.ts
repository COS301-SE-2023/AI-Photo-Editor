import sharp from "sharp"
import fs from "fs"
// import path from "path";

export default {
	test: test
}

export function test(value: number) {
	console.log(__dirname)
	const image = sharp("./assets/image.png")
	image.modulate({ brightness: value });
	image.toFile("./assets/edited-image.png")
	return fs.readFileSync("./assets/edited-image.png").toString('base64');
}