import { Common, Chain } from "@doomjs/ethereumjs-common";

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
