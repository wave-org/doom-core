import { HDKey } from "ethereum-cryptography/hdkey.js";
import {
  generateMnemonic,
  mnemonicToSeedSync,
} from "ethereum-cryptography/bip39/index.js";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english.js";
import {
  bufferToHex,
  privateToPublic,
  publicToAddress,
  privateToAddress,
  toBuffer,
} from "@ethereumjs/util";

type MiddleKey = {
  publicKey: Buffer;
  chainCode: Buffer;
  parentFingerprint: Buffer;
  index: number;
  depth: number;
};

export class Wallet {
  readonly privateKey: string;
  readonly chainCode: string;
  readonly publicKey: string;
  readonly address: string;
  readonly mnemonic: string | null;
  protected hdKey: HDKey;
  private middleHDKey: HDKey;
  readonly middleKey: MiddleKey;

  static fromMnemonic(mnemonic: string, password: string) {
    let seed = mnemonicToSeedSync(mnemonic, password);
    let hdKey = HDKey.fromMasterSeed(seed);
    return new Wallet(hdKey, mnemonic);
  }

  static fromRandomMnemonic(password: string) {
    let mnemonic = generateMnemonic(wordlist, 256);
    let seed = mnemonicToSeedSync(mnemonic, password);
    let hdKey = HDKey.fromMasterSeed(seed);
    return new Wallet(hdKey, mnemonic);
  }

  static fromExtendedKey(base58key: string) {
    let hdKey = HDKey.fromExtendedKey(base58key);
    return new Wallet(hdKey, null);
  }

  constructor(hdKey: HDKey, mnemonic: string | null) {
    this.hdKey = hdKey;
    this.mnemonic = mnemonic;
    if (hdKey.privateKey == null || hdKey.chainCode == null) {
      throw new Error("HDKey: expected with privateKey");
    }
    this.privateKey = bufferToHex(Buffer.from(hdKey.privateKey));
    this.chainCode = bufferToHex(Buffer.from(hdKey.chainCode));
    this.publicKey = bufferToHex(
      privateToPublic(Buffer.from(hdKey.privateKey))
    );
    this.address = bufferToHex(
      publicToAddress(privateToPublic(Buffer.from(hdKey.privateKey)))
    );

    // middle key
    this.middleHDKey = hdKey.derive(Wallet.OriginPath);
    if (
      this.middleHDKey.chainCode === null ||
      this.middleHDKey.publicKey == null
    ) {
      throw new Error("HDKey: middle must have chaincode and publickey");
    }
    this.middleKey = {
      publicKey: Buffer.from(this.middleHDKey.publicKey),
      chainCode: Buffer.from(this.middleHDKey.chainCode),
      parentFingerprint: toBuffer(this.middleHDKey.parentFingerprint),
      index: this.middleHDKey.index,
      depth: this.middleHDKey.depth,
    };
  }

  /**
   * FullPath = OriginPath + ChildPath + wildcard
   * We use a originPath to generate a middle public key to export
   */
  static FullPath = "M/89'/6'/4/20'/19/666/*/1024";
  static OriginPath = "M/89'/6'/4/20'/19";
  static ChildPath = "M/666/*/1024";
  static MAX_INDEX = 1000;

  getDerivedPrivateKeyByIndex(index: number): Buffer {
    const fullPath = Wallet.FullPath.replace("*", String(index));
    return this.getDerivedPrivateKey(fullPath);
  }

  getDerivedAddressByIndex(index: number): string {
    if (index > Wallet.MAX_INDEX) {
      throw new Error("index can't be larger than 1000");
    }
    const privateKey = this.getDerivedPrivateKeyByIndex(index);
    return bufferToHex(privateToAddress(privateKey));
  }

  getDerivedPrivateKey(path: string): Buffer {
    let hdkey = this.hdKey.derive(path);
    if (hdkey.privateKey == null) {
      throw new Error("HDKey: can't get privateKey");
    }
    return Buffer.from(hdkey.privateKey);
  }

  getPathFromAddress(addr: string): string {
    const address = addr.toLowerCase();
    for (let i = 0; i < Wallet.MAX_INDEX; i++) {
      const address_ = this.getDerivedAddressByIndex(i);
      if (address_ === address) {
        return Wallet.FullPath.replace("*", String(i));
      }
    }
    throw new Error("can not find address path");
  }
}
