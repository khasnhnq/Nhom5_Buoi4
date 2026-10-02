import { defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: "0.8.28",

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainId: 31338,
    },
  },
});
