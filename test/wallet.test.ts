import { Key } from "../src/key";

describe("Key", function () {
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";
  const address = "0x39ec5a00383f3e968d1f78edc6f302026c1f5871";
  const extenedKey =
    "xprvA2gJS5hGkExyUVvs39pAqNKwHw1N1JLUjCXhhtASUKYMjbJCrLzVu2yXT9ACYg8pKGPTNQWTgnrVU26hWfEXBxfjicHYpTGPzNQxokufcZf";

  it("generate a random mnemonic", async function () {
    const result = Key.fromRandomMnemonic(password);
    expect(result.address).toHaveLength(42);
    expect(result.mnemonic).not.toBeNull();
  });

  it("load from given mnemonic", async function () {
    const result = Key.fromMnemonic(mnemonic, password);
    expect(result.address).toBe(address);
    expect(result.mnemonic).not.toBeNull();
  });

  it("load with wrong password", async function () {
    const result = Key.fromMnemonic(mnemonic, password + "1");
    expect(result.address).not.toBe(address);
    expect(result.mnemonic).toBe(mnemonic);
  });

  it("load from extended key", async function () {
    const wallet = Key.fromExtendedKey(extenedKey);
    expect(wallet.address).toBe("0x40fdf02df1bd7104441b17b2c629c2d339dab655");
    expect(wallet.mnemonic).toBeNull();
  });

  it("generate a random mnemonic", async function () {
    const result = Key.generateRandomMnemonic();
    expect(result.split(" ")).toHaveLength(24);
    expect(result).not.toBe(
      "stamp evoke width vapor almost vault debate excuse enhance junior violin sign wise blame tornado load clerk orphan learn bullet alter acoustic region mango"
    );
  });

  it("generate a mnemonic by hash string", async function () {
    const result = Key.generateMenoicByHashString("test");
    expect(result.split(" ")).toHaveLength(24);
    expect(result).toBe(
      "supply poet damage retreat wish debate crunch two silent purpose lobster tortoise favorite mask want prosper clap video scheme label bulk soup comic park"
    );
  });
});
