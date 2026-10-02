import tokenJson from "./abi/MyToken.json";
import srcJson from "./abi/SourceBridge.json";
import dstJson from "./abi/DestinationBridge.json";

export const CHAIN_A = {
  chainId: 31337,
  chainIdHex: "0x7a69",
  ten: "Chuoi A (local)",
  rpc: "http://127.0.0.1:8547",
  token: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  bridge: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
};

export const CHAIN_B = {
  chainId: 31338,
  chainIdHex: "0x7a6a",
  ten: "Chuoi B (local)",
  rpc: "http://127.0.0.1:8548",
  wrapped: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  bridge: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
};

export const TOKEN_ABI = tokenJson.abi;
export const SRC_ABI = srcJson.abi;
export const DST_ABI = dstJson.abi;
