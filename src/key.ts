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

export class Key {
  readonly privateKey: Buffer;
  readonly chainCode: Buffer;
  readonly publicKey: Buffer;
  readonly fingerprint: Buffer;
  // if it is master key, parentFingerprint is null
  readonly parentFingerprint: Buffer | null;
  readonly depth: number;
  readonly hdKey: HDKey;

  readonly mnemonic: string | null;

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

  /// 256 bits hash hex string
  static hashPassword(password: string) {
    const entropy = sha512_256(password + "doom salt string");
    return bytesToHex(entropy);
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
    this.privateKey = Buffer.from(hdKey.privateKey);
    this.chainCode = Buffer.from(hdKey.chainCode);
    this.publicKey = Buffer.from(hdKey.publicKey!);
    this.fingerprint = Buffer.from(toBytes(hdKey.fingerprint));
    this.depth = hdKey.depth;
    if (this.depth === 0) {
      this.parentFingerprint = null;
    } else {
      this.parentFingerprint = Buffer.from(toBytes(hdKey.parentFingerprint));
    }
  }

  derivePath(path: string): Key {
    const derived = this.hdKey.derive(path);
    return new Key(derived, null);
  }
  sign(hash: Buffer): Buffer {
    return Buffer.from(this.hdKey.sign(hash));
  }
}
