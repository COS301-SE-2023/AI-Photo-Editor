import { firstTest, secondTest } from "./test1";

test('firstTest function', () => {
    expect(firstTest()).toBe("Test Working");
});

test('secondTest function', () => {
    expect(secondTest()).toBe("Test Working");
});