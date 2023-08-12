import * as bitcoinjs from "bitcoinjs-lib";
import { Psbt } from "bitcoinjs-lib";
import { Key } from "./key";
import { UR } from "@ngraveio/bc-ur";
import { bytesToHex, toBytes } from "@doomjs/ethereumjs-util";
import {
  CryptoAccount,
  PathComponent,
  CryptoKeypath,
  CryptoOutput,
  CryptoHDKey,
  ScriptExpressions,
  CryptoPSBT,
} from "@keystonehq/bc-ur-registry";

export class BtcWallet {
  readonly key: Key;
  readonly name: string;
  constructor(key: Key, name = "DOOM Wallet ") {
    this.key = key;
    this.name = name;
  }

  // 84 means BIP-84, which is for segwit, and the address starts with bc1
  // BIP 44 https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  // static DERIVATION_PATH = "m/84'/0'/0'/0/0";
  // the blue wallet will generate addresses by add "change" and "index"
  static BASE_DERIVATION_PATH = "m/84'/0'/0'";

  getConnectionUR() {
    let originComponents = this.getPathComponents(
      BtcWallet.BASE_DERIVATION_PATH
    );
    const extendedPublicKey = this.key.derivePath(
      BtcWallet.BASE_DERIVATION_PATH
    );
    const cryptoAccount = new CryptoAccount(
      Buffer.from(toBytes(this.key.hdKey.fingerprint)), // master fingerprint
      [
        new CryptoOutput(
          [ScriptExpressions.WITNESS_PUBLIC_KEY_HASH],
          new CryptoHDKey({
            isMaster: false,
            key: extendedPublicKey.publicKey,
            chainCode: extendedPublicKey.chainCode,
            origin: new CryptoKeypath(
              originComponents,
              extendedPublicKey.fingerprint,
              extendedPublicKey.depth
            ),
            parentFingerprint: extendedPublicKey.parentFingerprint!,
            name: this.name,
          })
        ),
      ]
    );

    const ur = cryptoAccount.toUREncoder(1000).nextPart();
    return ur;
  }

  /**
   * get child path from DefaultBasePath by adding a wildcard at the end
   * @returns PathComponent[]
   */
  private getPathComponents(path: string) {
    let items = path.split("/");
    let componenets = items.slice(1).map((item) => {
      let lastCharacter = item.charAt(item.length - 1);
      if (lastCharacter == "'") {
        let index = parseInt(item);
        return new PathComponent({
          index: index,
          hardened: true,
        });
      } else if (lastCharacter == "*") {
        return new PathComponent({
          hardened: false,
        });
      } else {
        let index = parseInt(item);
        return new PathComponent({
          index: index,
          hardened: false,
        });
      }
    });
    return componenets;
  }

  parseRequest(ur: UR) {
    if (ur.type !== "crypto-psbt") {
      throw new Error("ur.type !== crypto-psbt");
    }
    const psbt = CryptoPSBT.fromCBOR(ur.cbor);
    const uPsbtB64 = psbt.getPSBT().toString("base64");
    const psbtTx = Psbt.fromBase64(uPsbtB64);
    return psbtTx;
  }

  // fragmentsLength is ur.cbor length
  signRequest(request: Psbt, fragmentsLength: number = 1000): string[] {
    request.signAllInputsHD(this.key);
    const cryptoPSBT = new CryptoPSBT(request.toBuffer());
    const ur = cryptoPSBT.toUREncoder(fragmentsLength).encodeWhole();
    return ur;
  }

  // page size of addresses
  public static readonly PAGE_SIZE = 20;

  public getExternalAddress(index: number): string {
    return this.getDerivedAddressByPath(
      BtcWallet.BASE_DERIVATION_PATH + "/0/" + index
    );
  }

  public getChangeAddress(index: number): string {
    return this.getDerivedAddressByPath(
      BtcWallet.BASE_DERIVATION_PATH + "/1/" + index
    );
  }

  public getDerivedAddressByPath(path: string): string {
    const derived = this.key.derivePath(path);
    // address start with bc1
    const address = bitcoinjs.payments.p2wpkh({ pubkey: derived.publicKey })
      .address!;
    return address;
  }
}
