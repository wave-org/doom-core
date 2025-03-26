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

const jsonReplacer = (key: string, value: any) => {
  if (value.type === "Buffer") {
    return bytesToHex(value.data);
  }
  return value;
};

export interface DerivedAddress {
  // hex string
  masterFingerprint: string;
  derivationPath: string;
  // bc1 address
  address: string;
  publicKey: Buffer;
}
export class BTCSignRequest {
  readonly psbt: Psbt;
  // formatted json string
  readonly inputTx: string;
  readonly unsignedInputAddresses: DerivedAddress[];
  readonly outputTx: string;
  readonly inputData: string;
  readonly outputData: string;
  readonly PSBTGlobalMap: string;
  readonly version: number;
  readonly locktime: number;
  readonly fee: number;

  constructor(psbt: Psbt) {
    // psbt.finalizeAllInputs();
    this.psbt = psbt;
    this.inputTx = JSON.stringify(psbt.txInputs, jsonReplacer, 4);
    // console.log(this.inputTx);
    this.outputTx = JSON.stringify(psbt.txOutputs, jsonReplacer, 4);
    this.inputData = JSON.stringify(psbt.data.inputs, jsonReplacer, 4);
    this.outputData = JSON.stringify(psbt.data.outputs, jsonReplacer, 4);
    this.PSBTGlobalMap = JSON.stringify(psbt.data.globalMap, jsonReplacer, 4);
    this.version = psbt.version;
    this.locktime = psbt.locktime;
    // calculate fee, maybe not accurate
    const output = psbt.txOutputs.reduce((acc, output) => {
      return acc + output.value;
    }, 0);
    const input = psbt.data.inputs.reduce((acc, input) => {
      if (input.witnessUtxo) {
        return acc + input.witnessUtxo.value;
      }
      return acc;
    }, 0);
    this.unsignedInputAddresses = [];
    psbt.data.inputs.forEach((input) => {
      if (
        input.partialSig === undefined &&
        input.bip32Derivation !== undefined &&
        input.witnessUtxo !== undefined
      ) {
        const bip32Derivation = input.bip32Derivation[0];
        const derivationPath = bip32Derivation.path;
        const addressType = addressTypeFromDerivationRootPath(derivationPath);
        let address = "unsupported address type";
        switch (addressType) {
          case BTCAddressType.LEGACY:
            address = bitcoinjs.payments.p2pkh({
              pubkey: bip32Derivation.pubkey,
            }).address!;
          case BTCAddressType.TAPROOT:
            address = bitcoinjs.payments.p2tr({
              pubkey: bip32Derivation.pubkey,
            }).address!;
          case BTCAddressType.NESTED_SEGWIT:
            address = bitcoinjs.payments.p2sh({
              redeem: bitcoinjs.payments.p2wpkh({
                pubkey: bip32Derivation.pubkey,
              }),
            }).address!;
          case BTCAddressType.NATIVE_SEGWIT:
            address = bitcoinjs.payments.p2wpkh({
              pubkey: bip32Derivation.pubkey,
            }).address!;
        }

        this.unsignedInputAddresses.push({
          masterFingerprint: bytesToHex(bip32Derivation.masterFingerprint),
          derivationPath: derivationPath,
          address: address,
          publicKey: bip32Derivation.pubkey,
        });
      }
    });

    this.fee = input - output;
  }

  public canSignByKey(key: Key): boolean {
    // maybe it is a multisig wallet, so we need to check if the key can sign
    let canSign = false;
    this.unsignedInputAddresses.forEach((address) => {
      const publicKey = key.derivePath(address.derivationPath).publicKey;
      // return keyFingerprint === address.masterFingerprint;
      if (publicKey.equals(address.publicKey)) {
        canSign = true;
      }
    });
    return canSign;
  }
}

export enum BTCAddressType {
  LEGACY = 44,
  TAPROOT = 86,
  NESTED_SEGWIT = 49,
  NATIVE_SEGWIT = 84,
}

export function constructDerivationRootPath(
  type: BTCAddressType,
  accountIndex: number
): string {
  if (accountIndex < 0) {
    accountIndex = 0;
  }
  return `m/${type}'/0'/${accountIndex}'`;
}

export function addressTypeFromDerivationRootPath(
  path: string
): BTCAddressType {
  const items = path.split("/");
  const purpose = parseInt(items[1].slice(0, -1));
  return purpose as BTCAddressType;
}

export function validateDerivationRootPath(path: string): boolean {
  const items = path.split("/");
  if (items.length < 4) {
    return false;
  }
  if (items[0] !== "m") {
    return false;
  }
  if (items[1].slice(-1) !== "'") {
    return false;
  }
  if (items[2].slice(-1) !== "'") {
    return false;
  }
  if (items[3].slice(-1) !== "'") {
    return false;
  }
  const purpose = parseInt(items[1].slice(0, -1));
  // const coinType = parseInt(items[2].slice(0, -1));
  if (
    purpose !== BTCAddressType.LEGACY &&
    purpose !== BTCAddressType.TAPROOT &&
    purpose !== BTCAddressType.NESTED_SEGWIT &&
    purpose !== BTCAddressType.NATIVE_SEGWIT
  ) {
    return false;
  }
  return true;
}

export class BTCWallet {
  readonly key: Key;
  readonly name: string;
  readonly masterFingerprint: string;
  readonly addressType: BTCAddressType = BTCAddressType.NATIVE_SEGWIT;
  readonly derivationRootPath: string = BTCWallet.NATIVE_SEGWIT_ROOT_PATH;
  constructor(
    key: Key,
    name = "DOOM Wallet ",
    derivationPath: string = BTCWallet.NATIVE_SEGWIT_ROOT_PATH
  ) {
    this.key = key;
    this.name = name;
    this.masterFingerprint = bytesToHex(toBytes(this.key.hdKey.fingerprint));
    if (validateDerivationRootPath(derivationPath)) {
      this.derivationRootPath = derivationPath;
      this.addressType = addressTypeFromDerivationRootPath(derivationPath);
    } else {
      throw new Error("Invalid derivation path");
    }
  }

  // 84 means BIP-84, which is for SegWit, and the address starts with bc1
  // BIP 44 https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  // static DERIVATION_PATH = "m/84'/0'/0'/0/0";
  // the blue wallet will generate addresses by add "change" and "index"
  // We can't change it now because BlueWallet doesn't support and is always using this path

  // Legacy, P2PKH; prefix: "1"
  static readonly LEGACY_ROOT_PATH = "m/44'/0'/0'";
  // Taproot, P2TR; prefix: "bc1p"
  static readonly TAPROOT_ROOT_PATH = "m/86'/0'/0'";
  // Nested SegWit, P2SH-P2WPKH; prefix: "3"
  static readonly NESTED_SEGWIT_ROOT_PATH = "m/49'/0'/0'";
  // Native SegWit, P2WPKH; prefix: "bc1q"
  static readonly NATIVE_SEGWIT_ROOT_PATH = "m/84'/0'/0'";

  getConnectionUR() {
    let originComponents = this.getPathComponents(this.derivationRootPath);
    const extendedPublicKey = this.key.derivePath(this.derivationRootPath);
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
    let components = items.slice(1).map((item) => {
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
    return components;
  }

  parseRequest(ur: UR) {
    if (ur.type !== "crypto-psbt") {
      throw new Error("ur.type !== crypto-psbt");
    }
    const psbt = CryptoPSBT.fromCBOR(ur.cbor);
    const uPsbtB64 = psbt.getPSBT().toString("base64");
    const psbtTx = Psbt.fromBase64(uPsbtB64);
    return new BTCSignRequest(psbtTx);
  }

  // fragmentsLength is ur.cbor length
  signRequest(
    request: BTCSignRequest,
    fragmentsLength: number = 1000
  ): string[] {
    const psbt = request.psbt.clone();
    psbt.signAllInputsHD(this.key);
    // psbt.finalizeAllInputs();
    const cryptoPSBT = new CryptoPSBT(psbt.toBuffer());
    const ur = cryptoPSBT.toUREncoder(fragmentsLength).encodeWhole();
    return ur;
  }

  // page size of addresses
  static readonly PAGE_SIZE = 20;

  getExternalAddress(index: number): string {
    return this.getDerivedAddressByPath(
      this.derivationRootPath + "/0/" + index
    );
  }

  getChangeAddress(index: number): string {
    return this.getDerivedAddressByPath(
      this.derivationRootPath + "/1/" + index
    );
  }

  getDerivedAddressByPath(path: string): string {
    const derived = this.key.derivePath(path);
    switch (this.addressType) {
      case BTCAddressType.LEGACY:
        return bitcoinjs.payments.p2pkh({ pubkey: derived.publicKey }).address!;
      case BTCAddressType.TAPROOT:
        return bitcoinjs.payments.p2tr({ pubkey: derived.publicKey }).address!;
      case BTCAddressType.NESTED_SEGWIT:
        return bitcoinjs.payments.p2sh({
          redeem: bitcoinjs.payments.p2wpkh({ pubkey: derived.publicKey }),
        }).address!;
      case BTCAddressType.NATIVE_SEGWIT:
        return bitcoinjs.payments.p2wpkh({ pubkey: derived.publicKey })
          .address!;
      default:
        throw new Error("Unsupported address type");
    }
  }
}
