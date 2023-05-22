import { Edit } from "../lib/exposed-functions";
//import sharp from "sharp";
import { IEditPhoto } from "../lib/interfaces";


jest.mock('sharp', () => {
    sharp: jest.fn().mockImplementation(() => {
        return "hello";
    })
})

const data: IEditPhoto = {
    brightness: 0,
    saturation: 0,
    hue: 0,
    rotate: 0,
    shadow: 0
}

describe("Test exposed-functions", () => {
    let edit: Edit;

    beforeAll(() => {
        edit = new Edit();
    })
    test('firstTest function', () => {
        expect(edit).toBeDefined();
    });

    //test('Should initialize with correct file', () => {
    //    expect(edit.editPhoto(data)).toReturnWith("hello");
    //})
})
