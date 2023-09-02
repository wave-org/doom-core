import { HDKey } from "ethereum-cryptography/hdkey.js";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  entropyToMnemonic,
} from "ethereum-cryptography/bip39/index.js";
import { sha512_256 } from "@noble/hashes/sha512";
import bs58check from "bs58check";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english.js";
import { validateMnemonic } from "ethereum-cryptography/bip39/index.js";
import {
  bytesToHex,
  privateToPublic,
  publicToAddress,
  toBytes,
} from "@doomjs/ethereumjs-util";
import { chacha20poly1305 } from "@noble/ciphers/chacha";
import { randomBytes } from "@noble/ciphers/webcrypto/utils";

const salt = "doom salt string";

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

  static validateMnemonic = (mnemonic: string) => {
    return validateMnemonic(mnemonic, wordlist);
  };

  static fromMnemonic(mnemonic: string, password?: string) {
    let seed = mnemonicToSeedSync(mnemonic, password);
    let hdKey = HDKey.fromMasterSeed(seed);
    return new Key(hdKey, mnemonic);
  }

  /// 256 bits
  static generateRandomMnemonic() {
    return generateMnemonic(wordlist, 256);
  }

  static generateMnemonicByHashString(givenStr: string) {
    const entropy = sha512_256(givenStr + salt);
    return entropyToMnemonic(entropy, wordlist);
  }

  /// 256 bits hash hex string
  static hashPassword(password: string) {
    const entropy = sha512_256(password + salt);
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

  privateExtendedKey(): string {
    return this.hdKey.privateExtendedKey;
  }
  publicExtendedKey(): string {
    return this.hdKey.publicExtendedKey;
  }
}

export interface WalletExportFormat {
  mnemonic?: string;
  password?: string;
  privateExtendedKey?: string;
}

export const encryptWEF = (wef: WalletExportFormat, password: string) => {
  const data = Buffer.from(JSON.stringify(wef));
  const key = sha512_256(password + salt);
  const nonce12 = key.slice(0, 12);
  const chacha = chacha20poly1305(key, nonce12);
  const encrypted = chacha.encrypt(data);
  const base58 = bs58check.encode(encrypted);
  return base58;
};

export const decryptWEF = (
  encrypted: string,
  password: string
): WalletExportFormat => {
  const data = bs58check.decode(encrypted);
  const key = sha512_256(password + salt);
  const nonce12 = key.slice(0, 12);
  const chacha = chacha20poly1305(key, nonce12);
  const decrypted = chacha.decrypt(data);
  const jsonStr = Buffer.from(decrypted).toString();
  const json = JSON.parse(jsonStr);
  return json;
};
