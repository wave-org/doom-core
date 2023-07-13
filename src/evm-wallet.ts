import { Wallet } from "./wallet";
import {
  CryptoHDKey,
  PathComponent,
  CryptoKeypath,
} from "@keystonehq/bc-ur-registry";
import {
  importPublic,
  bufferToHex,
  toBuffer,
  privateToPublic,
} from "@ethereumjs/util";
import { secp256k1 } from "@noble/curves/secp256k1";

export class EVMWallet {
  readonly hdWallet: Wallet;
  readonly compressedPublicKey: string;
  name: string;
  constructor(wallet: Wallet, name = "DOOM cold wallet") {
    this.hdWallet = wallet;
    this.name = name;
    this.compressedPublicKey = EVMWallet.getCompressPublicKey(
      wallet.privateKey
    );
  }

  /**
   * return a UR for this HD wallet, which can be used to connect in MetaMask
   * (Uniform Resource, https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2020-006-urtypes.md)
   */
  getConnectionUR() {
    let childrenPath = new CryptoKeypath(EVMWallet.getDefaultChildPath());
    let cryptoHD = new CryptoHDKey({
      isMaster: false,
      isPrivateKey: false,
      key: Buffer.from(this.compressedPublicKey.substring(2), "hex"),
      chainCode: Buffer.from(this.hdWallet.chainCode.substring(2), "hex"),
      // origin is useless
      origin: new CryptoKeypath([], Buffer.from("22222222", "hex"), 0),
      children: childrenPath,
      name: this.name,
      //   note: "ttttt",
    });
    const ur = cryptoHD.toUREncoder(10000).nextPart();
    return ur;
  }

  signTransaction() {}

  /**
   * get child path from DefaultBasePath by adding a wildcard at the end
   * @returns PathComponent[]
   */
  static getDefaultChildPath() {
    let items = Wallet.DefaultBasePath.split("/");
    let childPath = items.slice(1).map((item) => {
      let lastCharacter = item.charAt(item.length - 1);
      if (lastCharacter == "'") {
        let index = parseInt(item);
        return new PathComponent({
          index: index,
          hardened: true,
        });
      } else {
        let index = parseInt(item);
        return new PathComponent({
          index: index,
          hardened: false,
        });
      }
    });
    return [...childPath, new PathComponent({ hardened: false })];
  }

  static getCompressPublicKey(privateKey: string) {
    return bufferToHex(
      Buffer.from(
        secp256k1.ProjectivePoint.fromPrivateKey(
          toBuffer(privateKey)
        ).toRawBytes(true)
      )
    );
  }
}
