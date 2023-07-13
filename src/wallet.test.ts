import { Wallet } from "./wallet";

describe("Wallet", function () {
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";
  const address = "0x39ec5a00383f3e968d1f78edc6f302026c1f5871";
  const extenedKey =
    "xprvA2gJS5hGkExyUVvs39pAqNKwHw1N1JLUjCXhhtASUKYMjbJCrLzVu2yXT9ACYg8pKGPTNQWTgnrVU26hWfEXBxfjicHYpTGPzNQxokufcZf";

  it("generate a random mnemonic", async function () {
    const result = Wallet.fromRandomMnemonic(password);
    expect(result.address).toHaveLength(42);
    expect(result.mnemonic).not.toBeNull();
  });

  it("load from given mnemonic", async function () {
    const result = Wallet.fromMnemonic(mnemonic, password);
    expect(result.address).toBe(address);
    expect(result.mnemonic).not.toBeNull();
  });

  it("load with wrong password", async function () {
    const result = Wallet.fromMnemonic(mnemonic, password + "1");
    expect(result.address).not.toBe(address);
    expect(result.mnemonic).toBe(mnemonic);
  });

  it("load from extended key", async function () {
    const wallet = Wallet.fromExtendedKey(extenedKey);
    expect(wallet.address).toBe("0x40fdf02df1bd7104441b17b2c629c2d339dab655");
    expect(wallet.mnemonic).toBeNull();
  });
});
