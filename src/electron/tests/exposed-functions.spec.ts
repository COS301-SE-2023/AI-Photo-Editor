// import { Edit } from "../lib/exposed-functions";
// import { IEditPhoto } from "../lib/interfaces";

// jest.mock("sharp", () => () => ({
//   modulate: jest.fn((data: IEditPhoto) => {
//     try {
//       expect(data.brightness).toBe(1);
//       expect(data.saturation).toBe(1);
//       expect(data.hue).toBe(1);
//     } catch {
//       throw new Error("modulate");
//     }
//   }),
//   rotate: jest.fn((data) => {
//     try {
//       expect(data).toBe(0);
//     } catch {
//       throw new Error("rotate");
//     }
//   }),
//   linear: jest.fn((data1, data2) => {
//     try {
//       expect(data1).toBe(1);
//       expect(data2).toBe(2);
//     } catch {
//       throw new Error("linear");
//     }
//   }),
//   toFile: () => ({
//     catch: jest.fn(),
//   }),
// }));

// jest.mock("fs", () => ({
//   readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
//   readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
//   existsSync: jest.fn(),
// }));

// const filename = "test/filename";

// describe("Test exposed-functions", () => {
//   let edit: Edit;

//   beforeEach(() => {
//     edit = new Edit();
//   });
//   test("firstTest function", () => {
//     expect(edit).toBeDefined();
//   });

//   // Undefined values
//   test("Should initialize values in data that is undefined", () => {
//     const data: IEditPhoto = {
//       brightness: undefined,
//       saturation: undefined,
//       hue: undefined,
//       rotate: undefined,
//       shadow: undefined,
//     };
//     edit.editPhoto(data, filename);
//   });

//   // Defined values
//   test("Should initialize values in data that is defined", () => {
//     const data: IEditPhoto = {
//       brightness: 1,
//       saturation: 1,
//       hue: 1,
//       rotate: 0,
//       shadow: 1,
//     };
//     edit.editPhoto(data, filename);
//   });

//   // Wrong values for modulate
//   test("Should not initialize modulate values in data with wrong values", async () => {
//     const data: IEditPhoto = {
//       brightness: 2,
//       saturation: 1,
//       hue: 1,
//       rotate: 0,
//       shadow: 1,
//     };
//     try {
//       await edit.editPhoto(data, filename);
//     } catch (e) {
//       expect(e.message).toBe("modulate");
//     }
//   });

//   test("Should not initialize rotate values in data with wrong values", async () => {
//     const data: IEditPhoto = {
//       brightness: 1,
//       saturation: 1,
//       hue: 1,
//       rotate: 400,
//       shadow: 1,
//     };
//     try {
//       await edit.editPhoto(data, filename);
//     } catch (e) {
//       expect(e.message).toBe("rotate");
//     }
//   });

//   test("Should not initialize linear values in data with wrong values", async () => {
//     const data: IEditPhoto = {
//       brightness: 1,
//       saturation: 1,
//       hue: 1,
//       rotate: 0,
//       shadow: 100,
//     };
//     try {
//       await edit.editPhoto(data, filename);
//     } catch (e) {
//       expect(e.message).toBe("linear");
//     }
//   });
// });
