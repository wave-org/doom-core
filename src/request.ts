import {
  bufferToHex,
  toBuffer,
  bufferToBigInt,
  bigIntToBuffer,
  bufferToInt,
  arrToBufArr,
} from "@ethereumjs/util";
import { Common, Hardfork, Chain } from "@ethereumjs/common";
import { RLP } from "@ethereumjs/rlp";
import { Wallet } from "./wallet";
import { getCommonByChainID } from "./common";
import {
  EthSignRequest,
  ETHSignature,
  DataType,
} from "@keystonehq/bc-ur-registry-eth";
import {
  personalSign,
  SignTypedDataVersion,
  signTypedData,
} from "@metamask/eth-sig-util";
import {
  Transaction,
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

class BaseSignRequest implements SignRequest {
  readonly id: string;
  readonly chainID: number | null;
  readonly address: string;
  readonly type: RequestType;
  protected originData: Buffer;
  protected derivationPath: string;

  readonly payload: any;
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
  }

  sign(wallet: Wallet): ETHSignature {
    throw new Error("");
  }
}

export class MessageSignRequest extends BaseSignRequest {
  readonly chainID: null;
  readonly type = RequestType.personalMessage;
  readonly payload: string;

  constructor(request: EthSignRequest) {
    super(request);

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

export class TypedDataSignRequest extends BaseSignRequest {
  readonly chainID: null;
  readonly type = RequestType.typedData;
  readonly payload: object;

  /// https://github.com/KeystoneHQ/keystone-airgaped-base/blob/76cd9a92b7a421895fb7a13e5071ec56cedfcdab/packages/base-eth-keyring/src/BaseKeyring.ts#L506
  /// Now, the base-eth-keyring doesn't pass the version to the ur, so we can't get version here.
  /// So, we said we only support V4.
  readonly typedDataVersion = SignTypedDataVersion.V4;

  constructor(request: EthSignRequest) {
    super(request);

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

export class TransactionSignRequest extends BaseSignRequest {
  readonly chainID: number;
  readonly type = RequestType.transaction;
  readonly payload: TransactionDetail;

  readonly transaction: Transaction;
  private common: Common;

  constructor(request: EthSignRequest) {
    super(request);

    if (this.chainID === null) {
      throw new Error(
        "EthSignRequest: request.getChainId() can not be undefined"
      );
    }

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
export class EIP1559TransactionSignRequest extends BaseSignRequest {
  readonly chainID: number;
  readonly type = RequestType.transaction;
  readonly payload: EIP1559TransactionDetail;
  readonly transaction: FeeMarketEIP1559Transaction;
  private common: Common;

  constructor(request: EthSignRequest) {
    super(request);
    if (this.chainID === null) {
      throw new Error(
        "EthSignRequest: request.getChainId() can not be undefined"
      );
    }
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

export function parseEthSignRequest(signRequest: EthSignRequest): SignRequest {
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
}

export function concatSig(r?: bigint, s?: bigint, v?: bigint): Buffer {
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
