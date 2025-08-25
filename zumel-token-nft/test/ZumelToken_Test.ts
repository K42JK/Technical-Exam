import { expect } from "chai";
import { ethers } from "hardhat";
import { ZumelToken } from "../typechain-types";

describe("ZumelToken", function () {
  let zumel: ZumelToken;
  let owner: any;
  let user1: any;
  let user2: any;

  const MAX_MINT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const ZumelTokenFactory = await ethers.getContractFactory("ZumelToken");
    zumel = (await ZumelTokenFactory.deploy()) as ZumelToken;
    await zumel.waitForDeployment();
  });

  async function runTest(description: string, testFn: () => Promise<void>) {
    console.log(`\nRunning test: ${description}`);
    try {
      await testFn();
      console.log(`Passed: ${description}`);
    } catch (err: any) {
      console.error(`Failed: ${description}`);
      console.error("Error:", err.message || err);
      throw err; // fail the test
    }
  }

  it("assigns initial supply to deployer", async function () {
    await runTest("assigns initial supply to deployer", async () => {
      const ownerBalance = await zumel.balanceOf(owner.address);
      const expected = ethers.parseEther("1000000");
      console.log("Expected:", expected.toString());
      console.log("Actual  :", ownerBalance.toString());
      expect(ownerBalance).to.equal(expected);
    });
  });

  it("allows user to mint up to 100 ZUMEL per 30 mins", async function () {
    await runTest("allows user to mint up to 100 ZUMEL per 30 mins", async () => {
      await zumel.connect(user1).mint(MAX_MINT);
      const balance = await zumel.balanceOf(user1.address);
      console.log("Expected:", MAX_MINT.toString());
      console.log("Actual  :", balance.toString());
      expect(balance).to.equal(MAX_MINT);
    });
  });

  it("reverts if mint exceeds 100 ZUMEL per period", async function () {
    await runTest("reverts if mint exceeds 100 ZUMEL per period", async () => {
      await zumel.connect(user1).mint(MAX_MINT);
      await expect(zumel.connect(user1).mint(ethers.parseEther("1")))
        .to.be.revertedWith("Rate limit exceeded for 30 min");
    });
  });

  it("resets rate limit after 30 minutes", async function () {
    await runTest("resets rate limit after 30 minutes", async () => {
      await zumel.connect(user1).mint(MAX_MINT);
      await ethers.provider.send("evm_increaseTime", [30 * 60]);
      await ethers.provider.send("evm_mine", []);
      await zumel.connect(user1).mint(MAX_MINT);

      const balance = await zumel.balanceOf(user1.address);
      const expected = MAX_MINT * 2n;
      console.log("Expected:", expected.toString());
      console.log("Actual  :", balance.toString());
      expect(balance).to.equal(expected);
    });
  });

  it("allows burning tokens", async function () {
    await runTest("allows burning tokens", async () => {
      await zumel.connect(user1).mint(MAX_MINT);
      await zumel.connect(user1).burn(ethers.parseEther("50"));
      const balance = await zumel.balanceOf(user1.address);
      const expected = ethers.parseEther("50");
      console.log("Expected:", expected.toString());
      console.log("Actual  :", balance.toString());
      expect(balance).to.equal(expected);
    });
  });

  it("reverts when burning more than balance", async function () {
    await runTest("reverts when burning more than balance", async () => {
      await expect(zumel.connect(user1).burn(ethers.parseEther("1"))).to.be.reverted;
    });
  });
});
