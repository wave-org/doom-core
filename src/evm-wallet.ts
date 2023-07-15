import { Wallet } from "./wallet";
import {
  CryptoHDKey,
  PathComponent,
  CryptoKeypath,
} from "@keystonehq/bc-ur-registry";
import {
  EthSignRequest,
  ETHSignature,
  DataType,
} from "@keystonehq/bc-ur-registry-eth";
import { URRegistryDecoder } from "@keystonehq/ur-decoder";
import {
  importPublic,
  bufferToHex,
  toBuffer,
  bufferToBigInt,
  bigIntToBuffer,
  bigIntToUnpaddedBuffer,
  bufferToInt,
  arrToBufArr,
  fromSigned,
  privateToPublic,
} from "@ethereumjs/util";
import { Common, Hardfork, Chain } from "@ethereumjs/common";
import { RLP } from "@ethereumjs/rlp";

import {
  personalSign,
  SignTypedDataVersion,
  signTypedData,
} from "@metamask/eth-sig-util";
import {
  Transaction,
  TxData,
  AccessList,
  FeeMarketEIP1559Transaction,
} from "@ethereumjs/tx";
export enum RequestType {
  transaction = 1,
  typedData = 2,
  personalMessage = 3,
}

export interface SignRequest {
  id: string;
  type: RequestType;
  chainID: number | null;
  address: string;

  payload: any;

  sign(wallet: Wallet): ETHSignature;
}

export class MessageSignRequest implements SignRequest {
  readonly id: string;
  readonly chainID: number | null;
  readonly address: string;
  readonly type = RequestType.personalMessage;
  readonly payload: string;

  private originData: Buffer;
  private derivationPath: string;

  constructor(request: EthSignRequest) {
    const _requestID = request.getRequestId();
    if (_requestID === undefined) {
      throw new Error(
        "EthSignRequest: request.getRequestId() can not be undefined"
      );
    }
    this.id = bufferToHex(_requestID);

    const _chainID = request.getChainId();
    if (_chainID === undefined) {
      this.chainID = null;
    } else {
      this.chainID = _chainID;
    }

    const _address = request.getSignRequestAddress();
    if (_address == undefined) {
      throw new Error(
        "EthSignRequest: request.getSignRequestAddress() can not be undefined"
      );
    }
    this.address = bufferToHex(_address);

    this.originData = request.getSignData();

    // the derivationPath is OriginPath + ChildPath
    // M is deleted by EthSignRequest
    this.derivationPath = "m/" + request.getDerivationPath();

    this.payload = this.originData.toString();
  }

  sign(wallet: Wallet) {
    const derivedPrivateKey = wallet.getDerivedPrivateKey(this.derivationPath);
    let hexSig = personalSign({
      privateKey: derivedPrivateKey,
      data: this.originData,
    });
    return new ETHSignature(toBuffer(hexSig), toBuffer(this.id));
  }
}

export type TransactionDetail = {
  nonce: number;
  gasPrice: bigint;
  gasLimit: bigint;
  to: string;
  value: bigint;
  /**
   * hex string
   */
  data: string;
};

export class TransactionSignRequest implements SignRequest {
  readonly id: string;
  readonly chainID: number;
  readonly address: string;
  readonly type = RequestType.transaction;
  readonly payload: TransactionDetail;

  private originData: Buffer;
  readonly transaction: Transaction;
  private derivationPath: string;
  private common: Common;

  constructor(request: EthSignRequest) {
    const _requestID = request.getRequestId();
    if (_requestID === undefined) {
      throw new Error(
        "EthSignRequest: request.getRequestId() can not be undefined"
      );
    }
    this.id = bufferToHex(_requestID);

    const _chainID = request.getChainId();
    if (_chainID === undefined) {
      throw new Error(
        "EthSignRequest: request.getRequestId() can not be undefined"
      );
    }
    this.chainID = _chainID;

    const _address = request.getSignRequestAddress();
    if (_address == undefined) {
      throw new Error(
        "EthSignRequest: request.getSignRequestAddress() can not be undefined"
      );
    }
    this.address = bufferToHex(_address);

    this.originData = request.getSignData();
    // the derivationPath is OriginPath + ChildPath
    // M is deleted by EthSignRequest
    this.derivationPath = "m/" + request.getDerivationPath();

    this.common = getCommonByChainID(this.chainID);

    // handle payload
    const values = arrToBufArr(RLP.decode(this.originData));

    if (!Array.isArray(values)) {
      throw new Error("Invalid serialized tx input. Must be array");
    }
    const [nonce, gasPrice, gasLimit, to, value, data] = values as [
      Buffer,
      Buffer,
      Buffer,
      Buffer,
      Buffer,
      Buffer
    ];
    this.payload = {
      nonce: bufferToInt(nonce),
      gasPrice: bufferToBigInt(gasPrice),
      gasLimit: bufferToBigInt(gasLimit),
      to: bufferToHex(to),
      value: bufferToBigInt(value),
      data: bufferToHex(data),
    };
    this.transaction = new Transaction(
      { nonce, gasPrice, gasLimit, to, value, data },
      { common: this.common }
    );
  }

  sign(wallet: Wallet) {
    const derivedPrivateKey = wallet.getDerivedPrivateKey(this.derivationPath);

    const signed = this.transaction.sign(derivedPrivateKey);
    const rsv = concatSig(signed.r, signed.s, signed.v);
    return new ETHSignature(rsv, toBuffer(this.id));
  }
}

export type EIP1559TransactionDetail = {
  nonce: number;
  to: string;
  value: bigint;
  /**
   * hex string
   */
  data: string;

  accessList: AccessList;

  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
  gasLimit: bigint;
};

/**
 * use for Ethereum
 */
export class EIP1559TransactionSignRequest implements SignRequest {
  readonly id: string;
  readonly chainID: number;
  readonly address: string;
  readonly type = RequestType.transaction;
  readonly payload: EIP1559TransactionDetail;

  private originData: Buffer;
  readonly transaction: FeeMarketEIP1559Transaction;
  private derivationPath: string;
  private common: Common;

  constructor(request: EthSignRequest) {
    const _requestID = request.getRequestId();
    if (_requestID === undefined) {
      throw new Error(
        "EthSignRequest: request.getRequestId() can not be undefined"
      );
    }
    this.id = bufferToHex(_requestID);

    const _chainID = request.getChainId();
    if (_chainID === undefined) {
      throw new Error(
        "EthSignRequest: request.getRequestId() can not be undefined"
      );
    }
    this.chainID = _chainID;

    const _address = request.getSignRequestAddress();
    if (_address == undefined) {
      throw new Error(
        "EthSignRequest: request.getSignRequestAddress() can not be undefined"
      );
    }
    this.address = bufferToHex(_address);

    this.originData = request.getSignData();
    // the derivationPath is OriginPath + ChildPath
    // M is deleted by EthSignRequest
    this.derivationPath = "m/" + request.getDerivationPath();

    this.common = getCommonByChainID(this.chainID);

    this.transaction = FeeMarketEIP1559Transaction.fromSerializedTx(
      request.getSignData(),
      { common: this.common }
    );
    this.payload = {
      nonce: Number(this.transaction.nonce),
      to: this.transaction.to!.toString(),
      value: this.transaction.value,
      /**
       * hex string
       */
      data: bufferToHex(this.transaction.data),

      accessList: this.transaction.AccessListJSON,

      maxPriorityFeePerGas: this.transaction.maxPriorityFeePerGas,
      maxFeePerGas: this.transaction.maxFeePerGas,
      gasLimit: this.transaction.gasLimit,
    };
  }

  sign(wallet: Wallet) {
    const derivedPrivateKey = wallet.getDerivedPrivateKey(this.derivationPath);

    const signed = this.transaction.sign(derivedPrivateKey);
    const rsv = concatSig(signed.r, signed.s, signed.v);
    return new ETHSignature(rsv, toBuffer(this.id));
  }
}

export class TypedDataSignRequest implements SignRequest {
  readonly id: string;
  readonly chainID: number | null;
  readonly address: string;
  readonly type = RequestType.typedData;
  readonly payload: object;

  private originData: Buffer;
  private derivationPath: string;

  /// https://github.com/KeystoneHQ/keystone-airgaped-base/blob/76cd9a92b7a421895fb7a13e5071ec56cedfcdab/packages/base-eth-keyring/src/BaseKeyring.ts#L506
  /// Now, the base-eth-keyring doesn't pass the version to the ur, so we can't get version here.
  /// So, we said we only support V4.
  readonly typedDataVersion = SignTypedDataVersion.V4;

  constructor(request: EthSignRequest) {
    const _requestID = request.getRequestId();
    if (_requestID === undefined) {
      throw new Error(
        "EthSignRequest: request.getRequestId() can not be undefined"
      );
    }
    this.id = bufferToHex(_requestID);

    const _chainID = request.getChainId();
    if (_chainID === undefined) {
      this.chainID = null;
    } else {
      this.chainID = _chainID;
    }

    const _address = request.getSignRequestAddress();
    if (_address == undefined) {
      throw new Error(
        "EthSignRequest: request.getSignRequestAddress() can not be undefined"
      );
    }
    this.address = bufferToHex(_address);

    this.originData = request.getSignData();
    // the derivationPath is OriginPath + ChildPath
    // M is deleted by EthSignRequest
    this.derivationPath = "m/" + request.getDerivationPath();

    this.payload = JSON.parse(this.originData.toString()) as object;
  }

  sign(wallet: Wallet) {
    const derivedPrivateKey = wallet.getDerivedPrivateKey(this.derivationPath);
    const data = JSON.parse(this.originData.toString());
    let hexSig = signTypedData({
      privateKey: derivedPrivateKey,
      data,
      version: this.typedDataVersion,
    });
    return new ETHSignature(toBuffer(hexSig), toBuffer(this.id));
  }
}

export class EVMWallet {
  readonly hdWallet: Wallet;
  readonly compressedPublicKey: string;
  name: string;
  constructor(wallet: Wallet, name = "DOOM Wallet ") {
    this.hdWallet = wallet;
    this.name = name;
  }

  /**
   * return a UR for this HD wallet, which can be used to connect in MetaMask
   * (Uniform Resource, https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2020-006-urtypes.md)
   */
  getConnectionUR() {
    let childrenPath = new CryptoKeypath(
      this.getPathComponents(Wallet.ChildPath)
    );
    let originComponents = this.getPathComponents(Wallet.OriginPath);
    let cryptoHD = new CryptoHDKey({
      isMaster: false,
      isPrivateKey: false,
      key: this.hdWallet.middleKey.publicKey,
      chainCode: this.hdWallet.middleKey.chainCode,
      origin: new CryptoKeypath(
        originComponents,
        this.hdWallet.middleKey.parentFingerprint,
        this.hdWallet.middleKey.depth
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

      if (signRequest.getDataType() === DataType.personalMessage) {
        return new MessageSignRequest(signRequest);
      } else if (signRequest.getDataType() === DataType.typedData) {
        return new TypedDataSignRequest(signRequest);
      } else if (signRequest.getDataType() === DataType.transaction) {
        return new TransactionSignRequest(signRequest);
      } else if (signRequest.getDataType() === DataType.typedTransaction) {
        return new EIP1559TransactionSignRequest(signRequest);
      } else {
        throw new Error("never");
      }
    } else {
      throw new Error("URRegistryDecoder error: " + decoder.resultError());
    }
  }

  signRequest(request: SignRequest) {
    const signature = request.sign(this.hdWallet);
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
}

export function getCommonByChainID(chainID: number) {
  if (chainID == 1) {
    return new Common({ chain: Chain.Mainnet });
  } else if (chainID == 56) {
    // bsc
    return Common.custom({
      name: "BNB Smart Chain",
      chainId: chainID,
      networkId: chainID,
    });
  } else {
    return Common.custom({
      name: "Custom Chain",
      chainId: chainID,
      networkId: chainID,
    });
  }
}

function concatSig(r?: bigint, s?: bigint, v?: bigint): Buffer {
  if (r === undefined || s === undefined || v === undefined) {
    throw new Error("transaction.sign failed!! can not get r,s,v");
  }

  const rStr = padWithZeroes(bigIntToBuffer(r).toString("hex"), 64);
  const sStr = padWithZeroes(bigIntToBuffer(s).toString("hex"), 64);
  const vStr = padWithZeroes(bigIntToBuffer(v).toString("hex"), 2);
  return Buffer.from(rStr + sStr + vStr, "hex");
}

function padWithZeroes(hexString: string, targetLength: number): string {
  if (targetLength > hexString.length) {
    return String.prototype.padStart.call(hexString, targetLength, "0");
  } else {
    return hexString;
  }
}
