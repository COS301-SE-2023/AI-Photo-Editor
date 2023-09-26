import { type } from "os";
import {TypeclassBuilder} from "../../../../../../src/electron/lib/plugins/builders/TypeclassBuilder"
import { MediaDisplayConfig, MediaDisplayType } from "../../../../../../src/shared/types";
import { Typeclass } from "../../../../../../src/electron/lib/registries/TypeclassRegistry";
import type { ConverterTriple } from "../../../../../../src/electron/lib/registries/TypeclassRegistry";


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


        const configurator: (data: string) => MediaDisplayConfig = (data: string) => {
            return {
                displayType: MediaDisplayType.TextBox,
                props: { content: "Invalid typeclass: Media display not specified" },
                contentProp: null,
                } as MediaDisplayConfig;
        }

        typeclassBuilder.setDisplayConfigurator(configurator);
        expect(typeclassBuilder["partial"].mediaDisplayConfigurator("a")).toEqual(configurator("a"));

        const build : Typeclass = {
            id: "number",
            description: "test description",
            subtypes: [],
            mediaDisplayConfig: configurator,
        }

        expect(typeclassBuilder["buildTypeclass"]).toEqual(build);

        const converters : ConverterTriple[] = [["test1",typeclassBuilder["partial"].id, fn], [typeclassBuilder["partial"].id,"test2", fn1]];
        expect(typeclassBuilder["buildConverters"]).toEqual(converters);

        expect(typeclassBuilder["build"]).toEqual([build,converters]);  
    })



});