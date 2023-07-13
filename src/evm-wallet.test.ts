import { EVMWallet } from "./evm-wallet";
import { Wallet } from "./wallet";

describe("Wallet", function () {
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";
  const address = "0x39ec5a00383f3e968d1f78edc6f302026c1f5871";
  const extenedKey =
    "xprvA2gJS5hGkExyUVvs39pAqNKwHw1N1JLUjCXhhtASUKYMjbJCrLzVu2yXT9ACYg8pKGPTNQWTgnrVU26hWfEXBxfjicHYpTGPzNQxokufcZf";

  it("get connection ur", async function () {
    const wallet = new EVMWallet(Wallet.fromExtendedKey(extenedKey));
    const ur = wallet.getConnectionUR();
    expect(wallet.hdWallet.mnemonic).toBeNull();
    expect(ur).toBe(
      "ur:crypto-hdkey/olaowkaxhdclaowtlesnolfdskiamoteckbydnfhkkzchdytsfuyztghnykbpdkkotcykioyylwdotaahdcxlshloshhchftwkpliywtecnegyaxpyltrtlbkoskcnnlykmohkmesaresfylfhhtamtaaddyotadlaaocycpcpcpcpaxaeattaaddyoyadleaywkaswkamwkaawklawkasjofygwgwgtcxiajljziecxkthsjzjzihjyioghmycx"
    );
    expect(wallet.compressedPublicKey).toBe(
      "0x02f08acda648c56392d31e112b3f79fd58f9ccdbfc549a7ea879a31a7da1f7eaa3"
    );
  });
});
