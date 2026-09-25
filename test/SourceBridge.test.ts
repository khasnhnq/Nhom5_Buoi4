import { expect } from "chai";
import { network } from "hardhat";

describe("SourceBridge", function () {
  it("khoa token va phat su kien TokensLocked", async function () {
    const { ethers } = await network.connect();
    const [chuSoHuu, nguoiDung] = await ethers.getSigners();

    const token = await ethers.deployContract("MyToken");

    const bridge = await ethers.deployContract("SourceBridge", [
      await token.getAddress(),
      chuSoHuu.address,
    ]);

    const soLuong = 1000n;

    await token.transfer(nguoiDung.address, soLuong);

    await token.connect(nguoiDung).approve(await bridge.getAddress(), soLuong);

    await expect(
      bridge.connect(nguoiDung).lock(nguoiDung.address, soLuong, 31338)
    ).to.emit(bridge, "TokensLocked");

    expect(await token.balanceOf(await bridge.getAddress())).to.equal(soLuong);
  });
});
