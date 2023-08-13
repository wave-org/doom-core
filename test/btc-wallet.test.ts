import { BTCWallet } from "../src/btc-wallet";
import { Key } from "../src/key";
import { URRegistryDecoder } from "@doomjs/keystonehq-ur-decoder";

describe("BTCWallet", function () {
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";

  it("get connection ur", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BTCWallet(key, "xr");
    expect(wallet.masterFingerprint).toBe("0xcc4bb496");
    const result = wallet.getConnectionUR();
    expect(result).toBe(
      "ur:crypto-account/oeadcysfgrqzmtaolytaadmwtaaddlonaxhdclaontgmltvowztngscnwpytylwpparninrsseylenmkpsaawpmhotwkkipldwytvtueaahdcxghsnqzgdsegoroenlukiimvtqzonrpiymdfzctrtutvllossbnglsfrttilfvllnamtaaddyotadlncsghykaeykaeykaocycsmudmisaxaxaycyykcmsntdasidksjpwydrynda"
    );
  });

  it("get external addresses", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BTCWallet(key, "xr");
    const result = wallet.getExternalAddress(0);
    expect(result).toBe("bc1qds67vf6c6fypgfs64cvxh3euwyqnxttcluyues");
  });

  it("get change/internal address", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BTCWallet(key, "xr");
    const result = wallet.getChangeAddress(0);
    // console.log(result);
    expect(result).toBe("bc1qu42nq04ta7pgfyasmksxwxl4fswztsa9atfud3");
  });

  it("sign transaction", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BTCWallet(key, "xr");

    const signRequestQRString =
      "ur:crypto-psbt/hkadchjojkidjyzmadaejsaoaeaeaeadlulnwlmeiabkiefgdtlrdwmkadmwdiyannecsgsafnbelnhlmubkdmmomecfwtvsbtaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaecmaebbjyetcnfepaehfhfpjkrlhdkiondiwkfplyoyrhambgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasronaeaeaeaeaeadadctcsjkadaeaeaeaeaecmaebbjzecvadihdtdfdbbdscyplcsjestfnjsadeodpkscpamaxfrsbdelocwsbbecplgwmguuewelyamhyolbnbtkboyeysgwzurimnblpzotdzcwycssfgrqzmtghaeaelaaeaeaelaaeaeaelaaeaeaeaeaeaeaeaeaeaecpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaedlstwklg";

    const decoder = new URRegistryDecoder();
    decoder.receivePart(signRequestQRString);

    expect(decoder.isComplete()).toBe(true);
    expect(decoder.isSuccess()).toBe(true);

    const ur = decoder.resultUR();
    const tx = wallet.parseRequest(ur);
    // console.log(JSON.stringify(tx, null, 4));

    expect(tx.fee).toBe(876);
    expect(tx.version).toBe(2);
    expect(tx.locktime).toBe(0);
    expect(tx.inputTx.length).toBeGreaterThan(0);
    expect(tx.outputTx.length).toBeGreaterThan(0);
    expect(tx.inputData.length).toBeGreaterThan(0);
    expect(tx.outputData.length).toBeGreaterThan(0);
    expect(tx.PSBTGlobalMap.length).toBeGreaterThan(0);

    const canSign = tx.canSignByKey(key);
    expect(canSign).toBe(true);
    expect(tx.unsignedInputAddresses.length).toBe(1);
    expect(tx.unsignedInputAddresses[0].address).toBe(
      "bc1qds67vf6c6fypgfs64cvxh3euwyqnxttcluyues"
    );

    const result = wallet.signRequest(tx);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      "ur:crypto-psbt/hkadlfjojkidjyzmadaejsaoaeaeaeadlulnwlmeiabkiefgdtlrdwmkadmwdiyannecsgsafnbelnhlmubkdmmomecfwtvsbtaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaecmaebbjyetcnfepaehfhfpjkrlhdkiondiwkfplyoyrhambgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasronaeaeaeaeaeadadctcsjkadaeaeaeaeaecmaebbjzecvadihdtdfdbbdscyplcsjestfnjsadeodpkscpaoaxfrsbdelocwsbbecplgwmguuewelyamhyolbnbtkboyeysgwzurimnblpzotdzcwyfldyfyaocxdyssieparsmofdkemnetytfxwsgsaamdhtzccfcetamefylkvybzpetaiyhlaefhaocxaofsiauoflehplsgonfzeoehiysffxhlfrpdlfnnjooturswmdjopemoqzbzttuoadcpamaxfrsbdelocwsbbecplgwmguuewelyamhyolbnbtkboyeysgwzurimnblpzotdzcwycssfgrqzmtghaeaelaaeaeaelaaeaeaelaaeaeaeaeaeaeaeaeaeaecpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaejectlype"
    );
  });

  it("sign transaction 2", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BTCWallet(key, "xr");

    const signRequestQRString =
      "ur:crypto-psbt/hkadcsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaecmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaeaygddncl";

    const decoder = new URRegistryDecoder();
    decoder.receivePart(signRequestQRString);

    expect(decoder.isComplete()).toBe(true);
    expect(decoder.isSuccess()).toBe(true);

    const ur = decoder.resultUR();
    const tx = wallet.parseRequest(ur);
    expect(tx.fee).toBe(876);
    expect(tx.version).toBe(2);
    expect(tx.locktime).toBe(0);
    expect(tx.inputTx.length).toBeGreaterThan(0);
    expect(tx.outputTx.length).toBeGreaterThan(0);
    expect(tx.inputData.length).toBeGreaterThan(0);
    expect(tx.outputData.length).toBeGreaterThan(0);
    expect(tx.PSBTGlobalMap.length).toBeGreaterThan(0);

    const canSign = tx.canSignByKey(key);
    expect(canSign).toBe(true);
    expect(tx.unsignedInputAddresses.length).toBe(1);
    expect(tx.unsignedInputAddresses[0].address).toBe(
      "bc1qu42nq04ta7pgfyasmksxwxl4fswztsa9atfud3"
    );

    const result = wallet.signRequest(tx);

    // console.log(result);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      "ur:crypto-psbt/hkadlsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaecmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspfldyfyaocxehtarsdyuyskjodrzssswedsstgtfyjnjpascslywejygylnsfqzaospkgvagozsaocxfdjtroayyahdtiemlbdmnlkniechnyaocypyylkobwlbiydenlcxztglvarlhphfadcpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaegsiemhjo"
    );
  });

  it("sign transaction with fragment length", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BTCWallet(key, "xr");

    const signRequestQRString =
      "ur:crypto-psbt/hkadcsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaecmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaeaygddncl";

    const decoder = new URRegistryDecoder();
    decoder.receivePart(signRequestQRString);

    expect(decoder.isComplete()).toBe(true);
    expect(decoder.isSuccess()).toBe(true);

    const ur = decoder.resultUR();
    const tx = wallet.parseRequest(ur);

    const canSign = tx.canSignByKey(key);
    expect(canSign).toBe(true);
    expect(tx.unsignedInputAddresses.length).toBe(1);
    expect(tx.unsignedInputAddresses[0].address).toBe(
      "bc1qu42nq04ta7pgfyasmksxwxl4fswztsa9atfud3"
    );
    const result = wallet.signRequest(tx, 100);
    expect(tx.fee).toBe(876);
    expect(tx.version).toBe(2);
    expect(tx.locktime).toBe(0);
    expect(tx.inputTx.length).toBeGreaterThan(0);
    expect(tx.outputTx.length).toBeGreaterThan(0);
    expect(tx.inputData.length).toBeGreaterThan(0);
    expect(tx.outputData.length).toBeGreaterThan(0);
    expect(tx.PSBTGlobalMap.length).toBeGreaterThan(0);
    expect(result.length).toBe(4);
    expect(result).toStrictEqual([
      "ur:crypto-psbt/1-4/lpadaacfadlncygsiemhjohdidhkadlsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaefdztgwdy",
      "ur:crypto-psbt/2-4/lpaoaacfadlncygsiemhjohdidcmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspfldmlrzcpr",
      "ur:crypto-psbt/3-4/lpaxaacfadlncygsiemhjohdiddyfyaocxehtarsdyuyskjodrzssswedsstgtfyjnjpascslywejygylnsfqzaospkgvagozsaocxfdjtroayyahdtiemlbdmnlkniechnyaocypyylkobwlbiydenlcxztglvarlhphfadcpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlngupagdsa",
      "ur:crypto-psbt/4-4/lpaaaacfadlncygsiemhjohdidwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaeaeaeieeoclst",
    ]);
  });
});
