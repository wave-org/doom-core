import { BtcWallet } from "../src/btc-wallet";
import { Key } from "../src/key";
import { URRegistryDecoder } from "@doomjs/keystonehq-ur-decoder";

describe("BtcWallet", function () {
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";

  it("get connection ur", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BtcWallet(key, "xr");
    const result = wallet.getConnectionUR();
    expect(result).toBe(
      "ur:crypto-account/oeadcysfgrqzmtaolytaadmwtaaddlonaxhdclaontgmltvowztngscnwpytylwpparninrsseylenmkpsaawpmhotwkkipldwytvtueaahdcxghsnqzgdsegoroenlukiimvtqzonrpiymdfzctrtutvllossbnglsfrttilfvllnamtaaddyotadlncsghykaeykaeykaocycsmudmisaxaxaycyykcmsntdasidksjpwydrynda"
    );
  });

  it("get external addresses", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BtcWallet(key, "xr");
    const result = wallet.getExternalAddress(0);
    expect(result).toBe("bc1qds67vf6c6fypgfs64cvxh3euwyqnxttcluyues");
  });

  it("get change/internal address", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BtcWallet(key, "xr");
    const result = wallet.getChangeAddress(0);
    // console.log(result);
    expect(result).toBe("bc1qu42nq04ta7pgfyasmksxwxl4fswztsa9atfud3");
  });

  it("sign transaction", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BtcWallet(key, "xr");

    const signRequestQRString =
      "ur:crypto-psbt/hkadchjojkidjyzmadaejsaoaeaeaeadlulnwlmeiabkiefgdtlrdwmkadmwdiyannecsgsafnbelnhlmubkdmmomecfwtvsbtaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaecmaebbjyetcnfepaehfhfpjkrlhdkiondiwkfplyoyrhambgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasronaeaeaeaeaeadadctcsjkadaeaeaeaeaecmaebbjzecvadihdtdfdbbdscyplcsjestfnjsadeodpkscpamaxfrsbdelocwsbbecplgwmguuewelyamhyolbnbtkboyeysgwzurimnblpzotdzcwycssfgrqzmtghaeaelaaeaeaelaaeaeaelaaeaeaeaeaeaeaeaeaeaecpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaedlstwklg";

    const decoder = new URRegistryDecoder();
    decoder.receivePart(signRequestQRString);

    expect(decoder.isComplete()).toBe(true);
    expect(decoder.isSuccess()).toBe(true);

    const ur = decoder.resultUR();
    const tx = wallet.parseRequest(ur);
    const result = wallet.signRequest(tx);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      "ur:crypto-psbt/hkadlfjojkidjyzmadaejsaoaeaeaeadlulnwlmeiabkiefgdtlrdwmkadmwdiyannecsgsafnbelnhlmubkdmmomecfwtvsbtaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaecmaebbjyetcnfepaehfhfpjkrlhdkiondiwkfplyoyrhambgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasronaeaeaeaeaeadadctcsjkadaeaeaeaeaecmaebbjzecvadihdtdfdbbdscyplcsjestfnjsadeodpkscpaoaxfrsbdelocwsbbecplgwmguuewelyamhyolbnbtkboyeysgwzurimnblpzotdzcwyfldyfyaocxdyssieparsmofdkemnetytfxwsgsaamdhtzccfcetamefylkvybzpetaiyhlaefhaocxaofsiauoflehplsgonfzeoehiysffxhlfrpdlfnnjooturswmdjopemoqzbzttuoadcpamaxfrsbdelocwsbbecplgwmguuewelyamhyolbnbtkboyeysgwzurimnblpzotdzcwycssfgrqzmtghaeaelaaeaeaelaaeaeaelaaeaeaeaeaeaeaeaeaeaecpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaejectlype"
    );
  });

  it("sign transaction 2", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BtcWallet(key, "xr");

    const signRequestQRString =
      "ur:crypto-psbt/hkadcsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaecmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaeaygddncl";

    const decoder = new URRegistryDecoder();
    decoder.receivePart(signRequestQRString);

    expect(decoder.isComplete()).toBe(true);
    expect(decoder.isSuccess()).toBe(true);

    const ur = decoder.resultUR();
    const tx = wallet.parseRequest(ur);
    const result = wallet.signRequest(tx);
    // console.log(result);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      "ur:crypto-psbt/hkadlsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaecmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspfldyfyaocxehtarsdyuyskjodrzssswedsstgtfyjnjpascslywejygylnsfqzaospkgvagozsaocxfdjtroayyahdtiemlbdmnlkniechnyaocypyylkobwlbiydenlcxztglvarlhphfadcpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaegsiemhjo"
    );
  });

  it("sign transaction with fragment length", async function () {
    const key = Key.fromMnemonic(mnemonic, password);
    const wallet = new BtcWallet(key, "xr");

    const signRequestQRString =
      "ur:crypto-psbt/hkadcsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaecmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaeaygddncl";

    const decoder = new URRegistryDecoder();
    decoder.receivePart(signRequestQRString);

    expect(decoder.isComplete()).toBe(true);
    expect(decoder.isSuccess()).toBe(true);

    const ur = decoder.resultUR();
    const tx = wallet.parseRequest(ur);
    const result = wallet.signRequest(tx, 100);
    expect(result.length).toBe(4);
    expect(result).toStrictEqual([
      "ur:crypto-psbt/1-4/lpadaacfadlncygsiemhjohdidhkadlsjojkidjyzmadaejpaoaeaeaeadesgypyrodyzmqdvaldhyaofglpvyasfznezcztrnmebeiezocastwsbnrkkbdpcladaeaeaeaezmzmzmzmaonyaoaeaeaeaeaeaechptbbjnfmtytkgouoiogmoydpdymetyenwsmybsmkdlyaltbnioadaeaeaeaeaefdztgwdy",
      "ur:crypto-psbt/2-4/lpaoaacfadlncygsiemhjohdidcmaebbwflgkbfsvdvsjpbshgkecyttemesnyftrpsrfxoxaeaeaeaeaeadadctbgjnadaeaeaeaeaecmaebbvwgodyfmpywslflrmupfutnbiocwykgscedasroncpaoaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlnwnfnfllkinkpluspfldmlrzcpr",
      "ur:crypto-psbt/3-4/lpaxaacfadlncygsiemhjohdiddyfyaocxehtarsdyuyskjodrzssswedsstgtfyjnjpascslywejygylnsfqzaospkgvagozsaocxfdjtroayyahdtiemlbdmnlkniechnyaocypyylkobwlbiydenlcxztglvarlhphfadcpamaxpsfrlnjzhdetytlovaoslymkgwfngtsehggllpcagwktfwlngupagdsa",
      "ur:crypto-psbt/4-4/lpaaaacfadlncygsiemhjohdidwnfnfllkinkpluspcssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeaeaeaeaeaeaecpaoaxnytiatbbyafwsbbntnmdgolawmwzintdyntbjoltcaaejsahlplkmhwzsevskijocssfgrqzmtghaeaelaaeaeaelaaeaeaelaadaeaeaeadaeaeaeaeaeaeieeoclst",
    ]);
  });
});
