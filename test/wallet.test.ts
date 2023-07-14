import { Wallet } from "../src/wallet";

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

  it("get derived address", async function () {
    const wallet = Wallet.fromExtendedKey(
      "xprv9s21ZrQH143K2j5M2tjsLq291PngUQCDGGAh3rsFCufb2wWqbNPmbWmAh46kYn6pbfNSEwCnPanQ3vFzKwc3CiEKxjGjybPZR6TBv2wqZoW"
    );
    const address0 = wallet.getDerivedAddressByIndex(0);

    expect(address0.toLowerCase()).toBe(
      "0xF21017473Cd241f104ecFB6097e1F1789BE324A2".toLowerCase()
    );
    const address12 = wallet.getDerivedAddressByIndex(12);

    expect(address12.toLowerCase()).toBe(
      "0xc9c758AfAf44cE08178D346CE4C39B1334EC4289".toLowerCase()
    );
  });

  it("get derived address 2", async function () {
    const wallet = Wallet.fromMnemonic(mnemonic, password);
    const address0 = wallet.getDerivedAddressByIndex(0);

    expect(address0.toLowerCase()).toBe(
      "0x1167c0B3D645e271416cbffc93036D8e1150b745".toLowerCase()
    );
  });
});
