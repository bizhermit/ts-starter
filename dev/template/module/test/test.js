// https://jestjs.io/

const index = require("../dist/index");

test("sync test", () => {
    expect(index.getNumberTextSync()).toBe("0123456789");
});

test("async test", async () => {
    expect(await index.getNumberTextAsync()).toBe("0123456789");
    
    // await expect(index.getNumberTextAsync()).resolves.toBe("01234567890"); // intentional error

    try {
        await index.getNumberTextAsync(true);
    } catch(e) {
        expect(e).toMatch("error.");
    }
    
    // await expect(index.getNumberTextAsync(true)).rejects.toMatch("success."); // intentional error
});