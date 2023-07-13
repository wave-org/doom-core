import { HDKey } from "ethereum-cryptography/hdkey.js";
import {
  generateMnemonic,
  mnemonicToSeedSync,
} from "ethereum-cryptography/bip39/index.js";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english.js";
// import { bytesToHex as toHex } from "ethereum-cryptography/utils.js";
// import { Address } from "@ethereumjs/util"
// import { keccak256, keccak224, keccak384, keccak512 } from "ethereum-cryptography/keccak.js";
// import { TypedTransaction } from '@ethereumjs/tx';
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
  readonly publicKey: string;
  readonly address: string;
  readonly mnemonic: string | null;
  private hdKey: HDKey;

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

  constructor(hdKey: HDKey, mnemonic: string) {
    this.hdKey = hdKey;
    this.mnemonic = mnemonic;
    if (hdKey.privateKey == null) {
      throw new Error("HDKey: expected with privateKey");
    }
    this.privateKey = bufferToHex(Buffer.from(hdKey.privateKey));
    this.publicKey = bufferToHex(
      privateToPublic(Buffer.from(hdKey.privateKey))
    );
    this.address = bufferToHex(
      publicToAddress(privateToPublic(Buffer.from(hdKey.privateKey)))
    );
  }
}
