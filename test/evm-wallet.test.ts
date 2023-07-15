import { EVMWallet } from "../src/evm-wallet";
import {
  RequestType,
  TransactionSignRequest,
  EIP1559TransactionSignRequest,
} from "../src/request";
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
    // https://bscscan.com/tx/0xa8d4bd99e1f361bcf4734fd25be9f4badd5e07def08854578b7791332ef2b3c3
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
      expect(transactionRequest.payload.nonce).toBe(0);
      expect(transactionRequest.payload.data).toBe("0x");
      expect(transactionRequest.payload.to).toBe(
        "0x1167c0b3d645e271416cbffc93036d8e1150b745"
      );
      expect(transactionRequest.payload.gasPrice.toString()).toBe("3000000000");
      expect(transactionRequest.payload.gasLimit.toString()).toBe("21000");
    }
  });

  it("BSC: sign contract transaction", async function () {
    // https://bscscan.com/tx/0x3a720a6e0c456040af834ef2b622683313c193142cea56bb7fb470ca21bf6095
    const signRequestQRString =
      "UR:ETH-SIGN-REQUEST/OLADTPDAGDJZLYHHETWMDNFLBZPYJZJYCTHNRFVLKTAOHDIMYAISADLRPRTIHYAELFPSGEMWGOTEMKEYJLNLAHNEYLKPFDGMFGNLMHDIQDCFKKGOLAROFYASHYOSQDAEAEAEAEAEAEAEAEAEAEAEAESFMNJNAESEKBQZEHECBNJZGDTPROWTGYKORHBDBYAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEADVWWTKIIMPAGAMHAEAEETLALAAXADAACSETAHTAADDYOEADMHCSHKYKAMYKAAWKBBYKBWWKCFAONYWKAEWKCFAAAEWKAOCYFDOSPLOXAMGHBYIORTQDTBFEVOJSFPJZRSZTMUAXJNMNBYGDRLFEFSTSWERK";

    const expectedUR =
      "ur:eth-signature/oeadtpdagdjzlyhhetwmdnflbzpyjzjycthnrfvlktaohdfplololtsscpgtjplfadsomhvwjptyssiafplojnjztdkbethtjtyalfrhdnfemnmhbdrksegyoektcmstglpsvtmklgotsozettnsvdoxosftiamkhgcwmunbwkbtfxismwptiniofs";
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
      expect(transactionRequest.payload.nonce).toBe(1);
      expect(transactionRequest.payload.data).toBe(
        "0x095ea7b3000000000000000000000000cc8e6d00c17eb431350c6c50d8b8f05176b90b110000000000000000000000000000000000000000000001e5f07d6ab149900000"
      );
      expect(transactionRequest.payload.to).toBe(
        "0x55d398326f99059ff775485246999027b3197955"
      );
      expect(transactionRequest.payload.gasPrice.toString()).toBe("3000000000");
      expect(transactionRequest.payload.gasLimit.toString()).toBe("44106");
    }
  });

  it("ETH: sign normal transaction", async function () {
    // https://etherscan.io/tx/0x0d31395f99c761a13690b2b84af147e107dd20a366c4560a314a734aa114a156
    const signRequestQRString =
      "UR:ETH-SIGN-REQUEST/OLADTPDAGDCTLYESWTLPDEGARONEPMMUAAKGDYCMTYAOHDDRAOVSADLALRAHYKVYAELPAXKBBYTBAELFGMAYMWBYIORTQDTBFEVOJSFPJZRSZTMUAXJNMNBYGDRLFELALARTAXAAAAADAHTAADDYOEADMHCSHKYKAMYKAAWKBBYKBWWKCFAONYWKAEWKCFAAAEWKAOCYFDOSPLOXAMGHBYIORTQDTBFEVOJSFPJZRSZTMUAXJNMNBYGDRLFEEYDTMWEO";

    const expectedUR =
      "ur:eth-signature/oeadtpdagdctlyeswtlpdegaronepmmuaakgdycmtyaohdfpgscttopflyndkgpyfzrydylyvtbbdlktgsmsihbkiekguewfuobeaxtkplimjehkdpsnbazcylatlrbtyafrlyltzsnnyalgehtlprlpvynlgubgytcsmneyintkhdfzaeoynsgsyt";
    const wallet = new EVMWallet(Wallet.fromMnemonic(mnemonic, password));
    const request = wallet.parseRequest(signRequestQRString);

    expect(request).not.toBeNull();
    if (request != null) {
      const result = wallet.signRequest(request);
      expect(result).toBe(expectedUR);
      expect(request.address).toBe(address);
      expect(request.chainID).toBe(1);
      expect(request.type).toBe(RequestType.transaction);

      const transactionRequest = request as EIP1559TransactionSignRequest;
      expect(transactionRequest.payload.nonce).toBe(0);
      expect(transactionRequest.payload.data).toBe("0x");
      expect(transactionRequest.payload.to).toBe(
        "0x1167c0b3d645e271416cbffc93036d8e1150b745"
      );

      expect(transactionRequest.payload.maxPriorityFeePerGas.toString()).toBe(
        "100000000"
      );
      expect(transactionRequest.payload.maxFeePerGas.toString()).toBe(
        "15000000000"
      );
      expect(transactionRequest.payload.gasLimit.toString()).toBe("21000");
    }
  });

  it("ETH: sign contract transaction", async function () {
    // https://etherscan.io/tx/0x1b7fab840a7e169fa8a01a787b12d3f93b6baac061c24e6277e2ed255cc22b44
    const signRequestQRString =
      "UR:ETH-SIGN-REQUEST/OLADTPDAGDUYTALKKSUEVSFDFPRENSADGSHTZCNERFAOHDJOAOYAJNADADLRAHYKVYAELPAXKBBYTBAELFWPAYMWNBROINMESWCLLUENSETTNTGEDMNNPFTOENAMWMFDLAROFYASHYOSQDAEAEAEAEAEAEAEAEAEAEAEAEFHSOCYFTZCJOESHHTYMTSWFLTLOLSFNTGRDNLBPMAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAOCMGRSOAERTAXAAAAADAHTAADDYOEADMHCSHKYKAMYKAAWKBBYKBWWKCFAONYWKAEWKCFAAAEWKAOCYFDOSPLOXAMGHBYIORTQDTBFEVOJSFPJZRSZTMUAXJNMNBYGDRLFEIDUYROTA";

    const expectedUR =
      "ur:eth-signature/oeadtpdagduytalkksuevsfdfprensadgshtzcnerfaohdfpmsverowttbetheaxfzsfbwmowngugosasfldhysatkvedraapymstbrfykimrlhhimlaihhgcmdthsqzaddlfhqzhtplbyoyiejtoyaylkrdlpwzdmgyykltmwwdgydmaeeysnrfpk";
    const wallet = new EVMWallet(Wallet.fromMnemonic(mnemonic, password));
    const request = wallet.parseRequest(signRequestQRString);

    expect(request).not.toBeNull();
    if (request != null) {
      const result = wallet.signRequest(request);
      expect(result).toBe(expectedUR);
      expect(request.address).toBe(address);
      expect(request.chainID).toBe(1);
      expect(request.type).toBe(RequestType.transaction);

      const transactionRequest = request as EIP1559TransactionSignRequest;
      expect(transactionRequest.payload.nonce).toBe(1);
      expect(transactionRequest.payload.data).toBe(
        "0x095ea7b30000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad00000000000000000000000000000000000000000000000000000002164bc900"
      );
      expect(transactionRequest.payload.to).toBe(
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      );

      expect(transactionRequest.payload.maxPriorityFeePerGas.toString()).toBe(
        "100000000"
      );
      expect(transactionRequest.payload.maxFeePerGas.toString()).toBe(
        "15000000000"
      );
      expect(transactionRequest.payload.gasLimit.toString()).toBe("60424");
    }
  });
});
