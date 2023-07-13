import { Wallet } from "./wallet";

describe("Wallet", function () {
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";
  const address = "0x39ec5a00383f3e968d1f78edc6f302026c1f5871";

  it("generate from random mnemonic", async function () {
    const result = Wallet.fromRandomMnemonic(password);
    expect(result.address).toHaveLength(42);
  });

  it("generate from given mnemonic", async function () {
    const result = Wallet.fromMnemonic(mnemonic, password);
    expect(result.address).toEqual(address);
  });
});
