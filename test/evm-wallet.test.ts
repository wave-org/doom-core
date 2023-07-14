import {
  EVMWallet,
  RequestType,
  TransactionSignRequest,
} from "../src/evm-wallet";
import { Wallet } from "../src/wallet";

describe("Wallet", function () {
  const mnemonic =
    "farm library shuffle knee equal blush disease table deliver custom farm stereo fat level dawn book advance lamp clutch crumble gaze law bird jazz";
  const password = "j1io2u7$@081nf%@au0-,.,3151lijasfa";
  const address = "0x1167c0b3d645e271416cbffc93036d8e1150b745";

  it("get connection ur", async function () {
    const wallet = new EVMWallet(Wallet.fromMnemonic(mnemonic, password));
    const ur = wallet.getConnectionUR();
    expect(ur).toBe(
      "ur:crypto-hdkey/olaowkaxhdclaoflaxtdhhpfprlnjsdavapmsbdtvazsvwcybztaghmwplpmbeehisbtdpidpadyueaahdcxwmfsbadltbfyfgpysbhpmsnycamnfwnlvytnsbnsztjpqdrerffnzshdasqzrploamtaaddyotadlecshkykamykaawkbbykbwwkaocyfdosploxaxahattaaddyoyadlncfaonywklawkcfaaaewkasjzfygwgwgtcxhghsjzjzihjycxdaktoelf"
    );
  });

  it("ETH: sign personal message", async function () {
    const signRequestQRString =
      "UR:ETH-SIGN-REQUEST/ONADTPDAGDHTCTRKYKHDCEFYATMHMWSPWZMWMDWFTYAOHDCTFEKSHSJNJOJZIHCXHNJOIHJPJKJLJTHSJZHEJKINIOJTHNCXJNIHJKJKHSIOIHAXAXAHTAADDYOEADMHCSHKYKAMYKAAWKBBYKBWWKCFAONYWKAEWKCFAAAEWKAOCYFDOSPLOXAMGHBYIORTQDTBFEVOJSFPJZRSZTMUAXJNMNBYGDRLFEFXAXLYPD";

    const expectedUR =
      "ur:eth-signature/oeadtpdagdhtctrkykhdcefyatmhmwspwzmwmdwftyaohdfpzmfrehnnjerttnwdvdcxrhhhfwcslurkvdgmgymuaykoeeaagttkjtcxvdvebthljyjsasamztvlktpmeoasdavlimtshnferowfgsbbostacklpayynmeisdsjzlrcacwqzmeltmd";

    const wallet = new EVMWallet(Wallet.fromMnemonic(mnemonic, password));
    const request = wallet.parseRequest(signRequestQRString);

    expect(request).not.toBeNull();
    if (request != null) {
      const result = wallet.signRequest(request);
      expect(request.address).toBe(address);
      expect(request.chainID).toBeNull();
      expect(request.payload).toBe("Example `personal_sign` message");
      expect(result).toBe(expectedUR);
    }
  });

  it("ETH: sign typed data v4", async function () {
    const signRequestQRString =
      "ur:eth-sign-request/onadtpdagdjegddrhgftcefdjlpffwlbhfiaknuodiaohkaxnlkgcpiejljnhsinjtcpftkgcpiaishsinjtgaiecpftcpehcpdwcpjthsjnihcpftcpfejyisihjpcxgthsinjzcpdwcpkoihjpiniykkinjtiofxjljtjyjphsiajycpftcpdyksfxiafxfxiaiaiaiafxfxfxfxiafxfxfxfxfxfxiafxiafxiaiafxiafxfxfxiafxiaiaiaiaiaiaiafxcpdwcpkoihjpjkinjljtcpftcpehcpkidwcpjnihjkjkhsioihcpftkgcpiajljtjyihjtjyjkcpftcpfdihjzjzjldwcxfwjlidclcpdwcpiyjpjljncpftkgcpjthsjnihcpftcpfxjlktcpdwcpkthsjzjzihjyjkcpfthpcpdyksfxfyeyhseoieesfgeseoetfeeheofxfyeseeemfeiadyecfpidfxemfgfeemeoeefyiyetfyfyeteyencpdwcpdyksfyihhsfyidihihiyiefefpieidihihiyiefehsieidfefefgieihhsieidihfefgiefehsfyidihihfgcphlkidwcpjyjlcpfthpkgcpjthsjnihcpftcpfwjlidcpdwcpkthsjzjzihjyjkcpfthpcpdyksidfwidfwfwfwfwididfwfwfwidididfwididfwididididfwfwidfwididididfwidfwididfwfwidfwcpdwcpdyksfwdyfwiehsfwihhsecemfwdyfwfyfpfwihfpecemiddyidiefpfwfefpecemiddyfwfyhsidfehsecemcpdwcpdyksfwdyfwdyiddyiddyiddyiddyfwdydydydydydydydydydydydydydydydydydydydydydydydydydydycphlkihlkidwcpjojpinjnhsjpkkghkkjoihcpftcpgthsinjzcpdwcpjykkjoihjkcpftkgcpfegagdemeheyfyjljnhsinjtcpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpkoihjpjkinjljtcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpiaishsinjtgaiecpdwcpjykkjoihcpftcpkpinjtjyeyecencpkidwkgcpjthsjnihcpftcpkoihjpiniykkinjtiofxjljtjyjphsiajycpdwcpjykkjoihcpftcphsieiejpihjkjkcpkihldwcpfljpjlkpjocpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpjnihjnidihjpjkcpdwcpjykkjoihcpftcpgdihjpjkjljthphlcpkihldwcpgthsinjzcpfthpkgcpjthsjnihcpftcpiyjpjljncpdwcpjykkjoihcpftcpgdihjpjkjljtcpkidwkgcpjthsjnihcpftcpjyjlcpdwcpjykkjoihcpftcpgdihjpjkjljthphlcpkidwkgcpjthsjnihcpftcpiajljtjyihjtjyjkcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkihldwcpgdihjpjkjljtcpfthpkgcpjthsjnihcpftcpjthsjnihcpdwcpjykkjoihcpftcpjkjyjpinjtiocpkidwkgcpjthsjnihcpftcpkthsjzjzihjyjkcpdwcpjykkjoihcpftcphsieiejpihjkjkhphlcpkihlkikiaxaoahtaaddyoeadmhcshkykamykaawkbbykbwwkcfaonywkaewkcfaaaewkaocyfdosploxamghbyiortqdtbfevojsfpjzrsztmuaxjnmnbygdrlfeiyrnmsjo";

    const expectedUR =
      "ur:eth-signature/oeadtpdagdjegddrhgftcefdjlpffwlbhfiaknuodiaohdfpgmbeckckeokkaokbmotnutytynjydtaelnfxrfrysovlcfwemskgtpaafsjpdkhfbacefmqdrowtfgdsolcsnngotsdevtfsjlzctsurfmhsgdbgbbdistvwaytesrylcwsguyoxhh";

    const wallet = new EVMWallet(Wallet.fromMnemonic(mnemonic, password));
    const request = wallet.parseRequest(signRequestQRString);

    expect(request).not.toBeNull();
    if (request != null) {
      const result = wallet.signRequest(request);
      expect(request.address).toBe(address);
      expect(request.chainID).toBeNull();
      expect(result).toBe(expectedUR);
    }
  });

  it("BSC: sign normal transaction", async function () {
    const signRequestQRString =
      "UR:ETH-SIGN-REQUEST/OLADTPDAGDSWLDPANTTOCHGWAMRHFELKJTNSOXPYLKAOHDDNWDLALRPRTIHYAELFGMAYMWBYIORTQDTBFEVOJSFPJZRSZTMUAXJNMNBYGDRLFELTATCYZCGALGAEAELAETLALAAXADAACSETAHTAADDYOEADMHCSHKYKAMYKAAWKBBYKBWWKCFAONYWKAEWKCFAAAEWKAOCYFDOSPLOXAMGHBYIORTQDTBFEVOJSFPJZRSZTMUAXJNMNBYGDRLFENTGREETE";

    const expectedUR =
      "ur:eth-signature/oeadtpdagdswldpanttochgwamrhfelkjtnsoxpylkaohdfpmywyzoytesjkclgewpksylzovezeidoxytcnhgkgwfcspeghrhbwjtjpkgfwvogsfthnplwfetneyavyvltlqdoevytdlsesfzjekgpkfxcslptlndfneoaakpbbbssgmucavosalp";
    const wallet = new EVMWallet(Wallet.fromMnemonic(mnemonic, password));
    const request = wallet.parseRequest(signRequestQRString);

    expect(request).not.toBeNull();
    if (request != null) {
      const result = wallet.signRequest(request);
      expect(result).toBe(expectedUR);
      expect(request.address).toBe(address);
      expect(request.chainID).toBe(56);
      expect(request.type).toBe(RequestType.transaction);

      const transactionRequest = request as TransactionSignRequest;
      expect(transactionRequest.supportEIP1559).toBe(false);
      expect(transactionRequest.payload.nonce).toBe(0);
      expect(transactionRequest.payload.data).toBe("0x");
      expect(transactionRequest.payload.to).toBe(address);
    }
  });
});
