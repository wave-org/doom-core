import { HDKey } from "ethereum-cryptography/hdkey.js";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  entropyToMnemonic,
} from "ethereum-cryptography/bip39/index.js";
import { sha512_256 } from "@noble/hashes/sha512";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english.js";
import {
  bytesToHex,
  privateToPublic,
  publicToAddress,
  toBytes,
} from "@doomjs/ethereumjs-util";

type MiddleKey = {
  publicKey: Buffer;
  chainCode: Buffer;
  parentFingerprint: Buffer;
  index: number;
  depth: number;
};

export class Key {
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
    return new Key(hdKey, mnemonic);
  }

  /// 256 bits
  static generateRandomMnemonic() {
    return generateMnemonic(wordlist, 256);
  }

  static generateMenoicByHashString(givenStr: string) {
    const entropy = sha512_256(givenStr + "doom salt string");
    return entropyToMnemonic(entropy, wordlist);
  }

  static fromRandomMnemonic(password: string) {
    let mnemonic = generateMnemonic(wordlist, 256);
    let seed = mnemonicToSeedSync(mnemonic, password);
    let hdKey = HDKey.fromMasterSeed(seed);
    return new Key(hdKey, mnemonic);
  }

  static fromExtendedKey(base58key: string) {
    let hdKey = HDKey.fromExtendedKey(base58key);
    return new Key(hdKey, null);
  }

  constructor(hdKey: HDKey, mnemonic: string | null) {
    this.hdKey = hdKey;
    this.mnemonic = mnemonic;
    if (hdKey.privateKey == null || hdKey.chainCode == null) {
      throw new Error("HDKey: expected with privateKey");
    }
    this.privateKey = bytesToHex(hdKey.privateKey);
    this.chainCode = bytesToHex(hdKey.chainCode);
    this.publicKey = bytesToHex(privateToPublic(hdKey.privateKey));
    this.address = bytesToHex(
      publicToAddress(privateToPublic(Buffer.from(hdKey.privateKey)))
    );

    // middle key
    this.middleHDKey = hdKey.derive(Key.OriginPath);
    if (
      this.middleHDKey.chainCode === null ||
      this.middleHDKey.publicKey == null
    ) {
      throw new Error("HDKey: middle must have chaincode and publickey");
    }
    this.middleKey = {
      publicKey: Buffer.from(this.middleHDKey.publicKey),
      chainCode: Buffer.from(this.middleHDKey.chainCode),
      parentFingerprint: Buffer.from(
        toBytes(this.middleHDKey.parentFingerprint)
      ),
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
    if (index > Key.MAX_INDEX) {
      throw new Error("index can't be larger than 1000");
    }
    const fullPath = Key.FullPath.replace("*", String(index));
    return this.getDerivedPrivateKey(fullPath);
  }

  getDerivedPrivateKey(path: string): Buffer {
    let hdkey = this.hdKey.derive(path);
    if (hdkey.privateKey == null) {
      throw new Error("HDKey: can't get privateKey");
    }
    return Buffer.from(hdkey.privateKey);
  }
}
