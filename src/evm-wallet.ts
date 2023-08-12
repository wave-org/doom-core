import { Key } from "./key";
import {
  CryptoHDKey,
  PathComponent,
  CryptoKeypath,
} from "@keystonehq/bc-ur-registry";
import { bytesToHex, privateToAddress } from "@doomjs/ethereumjs-util";
import { EthSignRequest } from "@doomjs/keystonehq-bc-ur-registry-eth";
import { UR } from "@ngraveio/bc-ur";

import { SignRequest, parseEthSignRequest } from "./request";

export class EVMWallet {
  readonly key: Key;
  readonly name: string;
  constructor(key: Key, name = "DOOM Wallet ") {
    this.key = key;
    this.name = name;
  }

  /**
   * return a UR for this HD wallet, which can be used to connect in MetaMask
   * (Uniform Resource, https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2020-006-urtypes.md)
   */
  getConnectionUR() {
    let childrenPath = new CryptoKeypath(this.getPathComponents(CHILD_PATH));

    const extendedPublicKey = this.key.derivePath(EXTENDED_PATH);
    let originComponents = this.getPathComponents(EXTENDED_PATH);

    let cryptoHD = new CryptoHDKey({
      isMaster: false,
      isPrivateKey: false,
      key: extendedPublicKey.publicKey,
      chainCode: extendedPublicKey.chainCode,
      origin: new CryptoKeypath(
        originComponents,
        extendedPublicKey.parentFingerprint!,
        extendedPublicKey.depth
      ),
      children: childrenPath,
      name: this.name,
      /**
       * https://github.com/KeystoneHQ/keystone-airgaped-base/blob/76cd9a92b7a421895fb7a13e5071ec56cedfcdab/packages/base-eth-keyring/src/BaseKeyring.ts#L150C11-L150C28
       * use note to decide account type. It will be standard with undefined.
       * this.keyringAccount = KEYRING_ACCOUNT.standard;
       */
      //   note: "",
    });

    const ur = cryptoHD.toUREncoder(10000).nextPart();
    return ur;
  }

  parseRequest(ur: UR): SignRequest {
    if (ur.type !== "eth-sign-request") {
      throw new Error("ur.type !== eth-sign-request");
    }
    const signRequest = EthSignRequest.fromCBOR(ur.cbor);
    return parseEthSignRequest(signRequest);
  }

  signRequest(request: SignRequest) {
    const signature = request.sign(this.key);
    return signature.toUREncoder(10000).nextPart();
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

  public getDerivedAddressByIndex(index: number): string {
    const path = FULL_PATH.replace("*", String(index));
    return this.getDerivedAddressByPath(path);
  }

  public getDerivedAddressByPath(path: string): string {
    const derived = this.key.derivePath(path);
    return bytesToHex(privateToAddress(derived.privateKey));
  }
}

/**
 * FullPath = OriginPath + ChildPath + wildcard
 * We use a originPath to generate a middle public key to export
 */
const FULL_PATH = "m/89'/6'/4/20'/19/666/*/1024";
const EXTENDED_PATH = "m/89'/6'/4/20'/19";
const CHILD_PATH = "m/666/*/1024";
