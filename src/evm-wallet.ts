import { Key } from "./key";
import {
  CryptoHDKey,
  PathComponent,
  CryptoKeypath,
} from "@keystonehq/bc-ur-registry";
import { bytesToHex, privateToAddress } from "@doomjs/ethereumjs-util";
import { EthSignRequest } from "@doomjs/keystonehq-bc-ur-registry-eth";
import { URRegistryDecoder } from "@doomjs/keystonehq-ur-decoder";

import { SignRequest, parseEthSignRequest } from "./request";

export class EVMWallet {
  readonly hdKey: Key;
  readonly compressedPublicKey: string;
  name: string;
  constructor(key: Key, name = "DOOM Wallet ") {
    this.hdKey = key;
    this.name = name;
  }

  /**
   * return a UR for this HD wallet, which can be used to connect in MetaMask
   * (Uniform Resource, https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2020-006-urtypes.md)
   */
  getConnectionUR() {
    let childrenPath = new CryptoKeypath(this.getPathComponents(Key.ChildPath));
    let originComponents = this.getPathComponents(Key.OriginPath);
    let cryptoHD = new CryptoHDKey({
      isMaster: false,
      isPrivateKey: false,
      key: this.hdKey.middleKey.publicKey,
      chainCode: this.hdKey.middleKey.chainCode,
      origin: new CryptoKeypath(
        originComponents,
        this.hdKey.middleKey.parentFingerprint,
        this.hdKey.middleKey.depth
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

  parseRequest(urString: string): SignRequest {
    const decoder = new URRegistryDecoder();
    decoder.receivePart(urString);
    if (decoder.isSuccess()) {
      const ur = decoder.resultUR();
      if (ur.type !== "eth-sign-request") {
        throw new Error("ur.type !== eth-sign-request");
      }
      const signRequest = EthSignRequest.fromCBOR(ur.cbor);

      return parseEthSignRequest(signRequest);
    } else {
      throw new Error("URRegistryDecoder error: " + decoder.resultError());
    }
  }

  signRequest(request: SignRequest) {
    const signature = request.sign(this.hdKey);
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
    const privateKey = this.hdKey.getDerivedPrivateKeyByIndex(index);
    return bytesToHex(privateToAddress(privateKey));
  }

  public getDerivedAddressByPath(path: string): string {
    const privateKey = this.hdKey.getDerivedPrivateKey(path);
    return bytesToHex(privateToAddress(privateKey));
  }
}
