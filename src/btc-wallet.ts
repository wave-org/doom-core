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
  // formated json string
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
        const address = bitcoinjs.payments.p2wpkh({
          pubkey: bip32Derivation.pubkey,
        }).address!;
        this.unsignedInputAddresses.push({
          masterFingerprint: bytesToHex(bip32Derivation.masterFingerprint),
          derivationPath: bip32Derivation.path,
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

export class BTCWallet {
  readonly key: Key;
  readonly name: string;
  readonly masterFingerprint: string;
  constructor(key: Key, name = "DOOM Wallet ") {
    this.key = key;
    this.name = name;
    this.masterFingerprint = bytesToHex(toBytes(this.key.hdKey.fingerprint));
  }

  // 84 means BIP-84, which is for segwit, and the address starts with bc1
  // BIP 44 https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
  // static DERIVATION_PATH = "m/84'/0'/0'/0/0";
  // the blue wallet will generate addresses by add "change" and "index"
  static readonly BASE_DERIVATION_PATH = "m/84'/0'/0'";

  getConnectionUR() {
    let originComponents = this.getPathComponents(
      BTCWallet.BASE_DERIVATION_PATH
    );
    const extendedPublicKey = this.key.derivePath(
      BTCWallet.BASE_DERIVATION_PATH
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
  public static readonly PAGE_SIZE = 20;

  public getExternalAddress(index: number): string {
    return this.getDerivedAddressByPath(
      BTCWallet.BASE_DERIVATION_PATH + "/0/" + index
    );
  }

  public getChangeAddress(index: number): string {
    return this.getDerivedAddressByPath(
      BTCWallet.BASE_DERIVATION_PATH + "/1/" + index
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
