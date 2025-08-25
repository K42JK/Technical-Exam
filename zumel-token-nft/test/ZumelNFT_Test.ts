import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { ZumelNFT, ZumelToken } from "../typechain-types";

describe("ZumelNFT", function () {
  let owner: Signer;
  let user1: Signer;
  let zumelToken: ZumelToken;
  let zumelNFT: ZumelNFT;

  const NFT_PRICE = ethers.parseEther("50");

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Deploy token and send user1 500 tokens
    const ZumelTokenFactory = await ethers.getContractFactory("ZumelToken");
    zumelToken = (await ZumelTokenFactory.deploy()) as ZumelToken;
    await zumelToken.waitForDeployment();
    await zumelToken.transfer(await user1.getAddress(), ethers.parseEther("500"));

    // Deploy NFT contract
    const ZumelNFTFactory = await ethers.getContractFactory("ZumelNFT");
    zumelNFT = (await ZumelNFTFactory.deploy(
      zumelToken.getAddress(), 
      await owner.getAddress()
    )) as ZumelNFT;
    await zumelNFT.waitForDeployment();
  });

  async function runTest(description: string, testFunc: () => Promise<void>) {
    console.log(`\nRunning test: ${description}`);
    try {
      await testFunc();
      console.log(`Passed: ${description}`);
    } catch (err: any) {
      console.error(`Failed: ${description}`);
      if (err?.reason) {
        console.error(`Revert reason: ${err.reason}`);
      } else if (err?.error?.message) {
        console.error(`Error message: ${err.error.message}`);
      } else {
        console.error(err);
      }
      throw err;
    }
  }

  it("has correct NFT price", async function () {
    await runTest("has correct NFT price", async () => {
      const actual = await zumelNFT.price();
      console.log("Expected:", NFT_PRICE.toString());
      console.log("Actual  :", actual.toString());
      expect(actual).to.equal(NFT_PRICE);
    });
  });

  it("allows user to mint NFT with ZumelToken", async function () {
    await runTest("allows user to mint NFT with ZumelToken", async () => {
      await zumelToken.connect(user1).approve(zumelNFT.getAddress(), NFT_PRICE);
      const tx = await zumelNFT.connect(user1).mint("ipfs://my-nft-uri");
      await tx.wait();

      const ownerAddr = await user1.getAddress();
      const nftOwner = await zumelNFT.ownerOf(1);
      const uri = await zumelNFT.tokenURI(1);

      console.log("Expected owner:", ownerAddr);
      console.log("Actual owner  :", nftOwner);
      console.log("Expected URI  :", "ipfs://my-nft-uri");
      console.log("Actual URI    :", uri);

      expect(nftOwner).to.equal(ownerAddr);
      expect(uri).to.equal("ipfs://my-nft-uri");
    });
  });

  it("reverts if user has insufficient ZumelToken balance", async function () {
    await runTest("reverts if user has insufficient ZumelToken balance", async () => {
      const ownerAddr = await owner.getAddress();
      await zumelToken.connect(user1).transfer(ownerAddr, ethers.parseEther("500"));
      await zumelToken.connect(user1).approve(zumelNFT.getAddress(), NFT_PRICE);

      await expect(zumelNFT.connect(user1).mint("ipfs://token1")).to.be.reverted;
    });
  });

  it("reverts if user does not approve ZumelTokens", async function () {
    await runTest("reverts if user does not approve ZumelTokens", async () => {
      await expect(zumelNFT.connect(user1).mint("ipfs://fail-uri")).to.be.reverted;
    });
  });

  it("allows owner to withdraw ZumelTokens", async function () {
    await runTest("allows owner to withdraw ZumelTokens", async () => {
      await zumelToken.connect(user1).approve(zumelNFT.getAddress(), NFT_PRICE);
      await zumelNFT.connect(user1).mint("ipfs://my-nft-uri");

      const ownerAddress = await owner.getAddress();
      const balanceBefore = await zumelToken.balanceOf(ownerAddress);
      await zumelNFT.connect(owner).withdrawZUMEL(ownerAddress, NFT_PRICE);
      const balanceAfter = await zumelToken.balanceOf(ownerAddress);

      console.log("Expected balance increase:", NFT_PRICE.toString());
      console.log("Actual balance increase  :", (balanceAfter - balanceBefore).toString());

      expect(balanceAfter - balanceBefore).to.equal(NFT_PRICE);
    });
  });

  it("reverts if non-owner tries to withdraw", async function () {
    await runTest("reverts if non-owner tries to withdraw", async () => {
      await expect(
        zumelNFT.connect(user1).withdrawZUMEL(await user1.getAddress(), NFT_PRICE)
      ).to.be.reverted;
    });
  });
});
