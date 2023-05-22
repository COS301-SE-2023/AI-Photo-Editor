import { Api } from "../preload";
import { ipcRenderer } from "electron";
import { IEditPhoto } from "../lib/interfaces";


jest.mock('electron', () => ({
    ipcMain: {
        on: jest.fn((event, callback) => {
            return event;
        })
    },
    ipcRenderer: {
        send: jest.fn((event, data: IEditPhoto) => {
            if(data){
                expect(data.brightness).toBe(0);
                expect(data.saturation).toBe(0);
                expect(data.hue).toBe(0);
                expect(data.rotate).toBe(0);
                expect(data.shadow).toBe(0);
            }
        }),
        on: jest.fn((event, callback) => {
            expect(callback()).toBe("correct");
        })
    },
    contextBridge: {
        exposeInMainWorld: jest.fn()
    }
}));

let data: IEditPhoto;

describe("Preload", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        data = {
            brightness: 0,
            saturation: 0,
            hue: 0,
            rotate: 0,
            shadow: 0
        }
    })

    //Testing send
    test("Should send to channel editPhoto", () => {
        Api.send('editPhoto', data)
        expect(ipcRenderer.send).toBeCalledWith('editPhoto', data);
    })

    test("Should not send to channel random", () => {
        Api.send('random', data)
        expect(ipcRenderer.send).toBeCalledTimes(0);
    })

    test("Should send wrong data to channel export-image", () => {
        data = {
            brightness: 0,
            saturation: 1,
            hue: 0,
            rotate: 0,
            shadow: 0
        }
        try{
            Api.send('export-image', data)
        }
        catch{
            expect(ipcRenderer.send).toBeCalledWith('export-image', data);
        }
    })

    //Testing receive
    test("Should listen on channel editPhoto", () => {
        Api.receive('editPhoto', () => {
            return "correct"
        });
        expect(ipcRenderer.on).toHaveBeenCalledWith('editPhoto', expect.anything());
    })

    test("Should not listen on channel random", () => {
        Api.receive('random', () => {
            return "correct"
        });
        expect(ipcRenderer.on).toHaveBeenCalledTimes(0);
    })

    test("Should send wrong function to channel export-image", () => {
        try{
            Api.receive('export-image', () => {
                return "wrong";
            })
        }
        catch{
            expect(ipcRenderer.on).toBeCalledWith('export-image', expect.anything());
        }
    })
    
})