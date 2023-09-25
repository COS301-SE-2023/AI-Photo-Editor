import {setSecret,settings,getSecret,getSecrets, clearSecret, setRecentProjects, getRecentProjects, decryptWithSafeStorage} from "../../../../src/electron/utils/settings";
import { safeStorage } from "electron";
import { recentProject } from "../../../../src/shared/types";


let flag = true; // Used to flip isEncryptionAvailable() return value

jest.mock("electron", () => ({
    safeStorage: {
        isEncryptionAvailable: jest.fn(() => {
            return flag;
        }),
        encryptString: jest.fn((value) => {

            const buff = Buffer.from(Buffer.from(value, 'utf8').toString('base64'), 'base64');
            return buff;
        }),
        decryptString: jest.fn((value) => {
            if (Buffer.isBuffer(value)) {
                const buff = Buffer.from(value.toString('base64'), 'base64');
                return buff.toString();
            }
            return value.toString();
        }),
    }
}));



describe("Testing settings.ts", () => {
    // let og = safeStorage.isEncryptionAvailable;

    beforeEach(() => {
        flag = true;
    });

    it("Test settings getting stored", () => {
        setSecret("key", "value");
        let buff = Buffer.from(Buffer.from("value", 'utf8').toString('base64'), 'base64');

        expect(settings.get("secrets.key")).toBe(buff.toString("base64"));

        setSecret("cookedKey", "cookedValue");
         buff = Buffer.from(Buffer.from("cookedValue", 'utf8').toString('base64'), 'base64');

        expect(settings.get("secrets.cookedKey")).toBe(buff.toString("base64"));
    });

    it("Test settings getting retrieved", () => {
        setSecret("key", "value");
        flag = false;
        setSecret("cookedKey", "cookedValue");
        flag = true;
        expect(getSecret("key")).toBe("value");
        flag = false;
        expect(getSecret("cookedKey")).toBe("cookedValue");
    })

    it("Test getting all the secrets", () => {
        setSecret("key", "value");
        setSecret("cookedKey", "cookedValue");
        const settings = getSecrets();
        expect(settings["key"]).toBe("value");
        expect(settings["cookedKey"]).toBe("cookedValue");
    })

    it("Test remaining functions", () => {
        const invalidTypeInput = 42 as unknown as string;
        expect(decryptWithSafeStorage(invalidTypeInput)).toBe("");

        expect(getSecret(invalidTypeInput)).toBe("");


        setSecret("key", "value");
        clearSecret("key");
        expect(settings.get("secrets.key")).toBe("");
        
        const projects : recentProject[] = [
            {
                path: "path",
                lastEdited: "lastEdited"
            }
        ];
        setRecentProjects(projects);
        expect(settings.get("recentProjects")).toEqual(projects);

        expect(getRecentProjects()).toEqual(projects);

        settings.set("secrets","ay");
        expect(getSecrets()).toEqual({});


        const nextInvalid = undefined as unknown as string;
        expect(decryptWithSafeStorage(nextInvalid)).toBe("");
        flag = false;
        expect(decryptWithSafeStorage(nextInvalid)).toBe("");

    })

});