import { type } from "os";
import {TypeclassBuilder} from "../../../../../../src/electron/lib/plugins/builders/TypeclassBuilder"


describe("TypeClassBuilder", () => {
    let typeclassBuilder : TypeclassBuilder;


    beforeEach(() => {
        typeclassBuilder = new TypeclassBuilder("test", "number");
    });


    it("Test constructor and getters and setters", () => {
        expect(typeclassBuilder).not.toBeNull();
        expect(typeclassBuilder["partial"].id).toBe("number");
        expect(typeof typeclassBuilder["partial"].mediaDisplayConfigurator("a")).toBe("object");

        typeclassBuilder.setDescription("test description");
        expect(typeclassBuilder["partial"].description).toBe("test description");

        const fn = (fromType: string) => {return "test";}
        typeclassBuilder.setFromConverters({"test1": fn});
        expect(typeclassBuilder["partial"].fromConverters).toEqual([["test1", fn]]);

        const fn1 = (toType: string) => {return "test";}
        typeclassBuilder.setToConverters({"test2": fn1});
        expect(typeclassBuilder["partial"].toConverters).toEqual([["test2", fn1]]);

    })



});