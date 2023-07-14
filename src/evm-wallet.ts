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
  bigIntToUnpaddedBuffer,
  bufferToInt,
  arrToBufArr,
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
    // getDerivationPath = origin + children ;
    // now origin == "" , so the real derivationPath = "m/"+getDerivationPath
    this.derivationPath = "m/" + request.getDerivationPath();

    this.payload = this.originData.toString();
  }

  sign(wallet: Wallet) {
    const derivedPrivateKey = wallet.getDerivedPrivateKey(this.derivationPath);
    let hexSig = personalSign({
      privateKey: derivedPrivateKey,
      data: this.originData,
    });
    const rsv = Buffer.from(hexSig.substring(2), "hex");
    return new ETHSignature(rsv, Buffer.from(this.id.substring(2), "hex"));
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
  readonly supportEIP1559: boolean;

  private originData: Buffer;
  private transaction: Transaction | null;
  private eip1559Transaction: FeeMarketEIP1559Transaction | null;
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
    // getDerivationPath = origin + children ;
    // now origin == "" , so the real derivationPath = "m/"+getDerivationPath
    this.derivationPath = "m/" + request.getDerivationPath();

    this.common = getCommonByChainID(this.chainID);

    if (request.getDataType() === DataType.typedTransaction) {
      this.supportEIP1559 = true;
      // TODO
      throw new Error("not implemented now TODO");
    } else {
      this.supportEIP1559 = false;
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
      // TODO
      // const [nonce, gasPrice, gasLimit, to, value, data] = [
      //   nonce_,
      //   gasPrice_,
      //   gasLimit_,
      //   to_,
      //   value_,
      //   data_,
      // ] as [Buffer, Buffer, Buffer, Buffer, Buffer, Buffer];
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
  }

  sign(wallet: Wallet) {
    const derivedPrivateKey = wallet.getDerivedPrivateKey(this.derivationPath);
    if (this.supportEIP1559) {
      throw new Error("TODO");
    } else {
      const signed = this.transaction!.sign(derivedPrivateKey);
      const rsv = Buffer.concat([
        bigIntToUnpaddedBuffer(signed.r!),
        bigIntToUnpaddedBuffer(signed.s!),
        bigIntToUnpaddedBuffer(signed.v!),
      ]);
      return new ETHSignature(rsv, Buffer.from(this.id.substring(2), "hex"));
    }
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
    // getDerivationPath = origin + children ;
    // now origin == "" , so the real derivationPath = "m/"+getDerivationPath
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
    const rsv = Buffer.from(hexSig.substring(2), "hex");
    return new ETHSignature(rsv, Buffer.from(this.id.substring(2), "hex"));
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

  parseRequest(urString: string) {
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
      } else if (
        signRequest.getDataType() === DataType.transaction ||
        signRequest.getDataType() === DataType.typedTransaction
      ) {
        return new TransactionSignRequest(signRequest);
      } else {
        throw new Error("never");
      }
    } else {
      throw new Error("URRegistryDecoder error: " + decoder.resultError());
    }
  }

  signRequest(request: SignRequest) {
    switch (request.type) {
      case RequestType.personalMessage:
        {
          const detailRequest = request as MessageSignRequest;

          const signature = detailRequest.sign(this.hdWallet);
          return signature.toUREncoder(10000).nextPart();
        }

        break;
      case RequestType.typedData: {
        const detailRequest = request as TypedDataSignRequest;

        const signature = detailRequest.sign(this.hdWallet);
        return signature.toUREncoder(10000).nextPart();
      }

      case RequestType.transaction:
        {
          const detailRequest = request as TransactionSignRequest;

          const signature = detailRequest.sign(this.hdWallet);
          return signature.toUREncoder(10000).nextPart();
        }
        break;
    }
  }

  //   signTransaction() {
  //     const values = arrToBufArr(RLP.decode(signRequest.getSignData()));

  //       if (!Array.isArray(values)) {
  //         throw new Error("Invalid serialized tx input. Must be array");
  //       }
  //       const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = values;
  //       let txData = { nonce, gasPrice, gasLimit, to, value, data };
  //       // TODO test v r s in ETH. but not eth is using EIP1559.
  //       // TODO support to import solidity or abi to get the function name and params.

  //       const parsedTxData = {
  //         nonce: bufferToInt(txData.nonce),
  //         gasPrice: bufferToBigInt(txData.gasPrice),
  //         gasLimit: bufferToBigInt(txData.gasLimit),
  //         to: bufferToHex(txData.to),
  //         value: bufferToBigInt(txData.value),
  //         data: bufferToHex(txData.data),
  //       };
  //       console.log(parsedTxData);
  //       const unsignedTx = new Transaction(txData, { common });
  //       // let tx = Transaction.fromSerializedTx(signRequest.getSignData(), {common})

  //       // console.log(`v: ${tx.v}`)
  //       // console.log(`this. signed: ${tx.isSigned()}`)
  //       console.log(
  //         `this.support EIP155 ${unsignedTx.supports(
  //           Capability.EIP155ReplayProtection
  //         )}`
  //       );

  //       let signed = unsignedTx.sign(
  //         Buffer.from(key.privateKey.substring(2), "hex")
  //       );
  //       // console.log(signed)
  //       // console.log(`signed.support EIP155 ${signed.supports(Capability.EIP155ReplayProtection)}`)

  //       // let rsv = r + s + v
  //       rsv = Buffer.concat([
  //         bigIntToUnpaddedBuffer(signed.r),
  //         bigIntToUnpaddedBuffer(signed.s),
  //         bigIntToUnpaddedBuffer(signed.v),
  //       ]);
  //   }
  signMessage(message: string) {}

  /**
   * Only support TypeData V4.
   * TODO test v3 data
   */
  signTypedData() {}

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

function getCommonByChainID(chainID: number) {
  if (chainID == 1) {
    return new Common({ chain: Chain.Mainnet });
  } else if (chainID == 56) {
    // bsc
    return Common.custom({
      name: "BNB Smart Chain",
      chainId: chainID,
      networkId: chainID,
      //   hardfork: Hardfork.London,
    });
  } else {
    return Common.custom({
      name: "Custom Chain",
      chainId: chainID,
      networkId: chainID,
      //   hardfork: Hardfork.London,
    });
  }
}
