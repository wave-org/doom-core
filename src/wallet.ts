import { HDKey } from "ethereum-cryptography/hdkey.js";
import {
  generateMnemonic,
  mnemonicToSeedSync,
} from "ethereum-cryptography/bip39/index.js";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english.js";
import {
  arrToBufArr,
  bufferToHex,
  ecsign,
  isValidPrivate,
  privateToPublic,
  publicToAddress,
  stripHexPrefix,
  toBuffer,
} from "@ethereumjs/util";

export class Wallet {
  readonly privateKey: string;
  readonly chainCode: string;
  readonly publicKey: string;
  readonly address: string;
  readonly mnemonic: string | null;
  protected hdKey: HDKey;

  /**
   * m/8/9/6/4/index
   */
  static DefaultBasePath = "m/8/9/6/4";

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
  }

  getPrivateKeyByIndex(index: number): Buffer {
    const fullPath = `${Wallet.DefaultBasePath}/${index}`;
    return this.getPrivateKey(fullPath);
  }

  getPrivateKey(path: string): Buffer {
    let hdkey = this.hdKey.derive(path);
    if (hdkey.privateKey == null) {
      throw new Error("HDKey: can't get privateKey");
    }
    return Buffer.from(hdkey.privateKey);
  }
}
