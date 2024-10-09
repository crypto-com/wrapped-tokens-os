import { ethers } from "hardhat";
import { LiquidETHV1Instance } from "../../../@types/generated";
import {
  OracleUpdated,
  ExchangeRateUpdated,
} from "../../../@types/generated/LiquidETHV1";
const { expectRevert } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");

const LiquidETHV1 = artifacts.require("LiquidETHV1");

contract("LiquidETHV1", (accounts) => {
  const stakedTokenOwner = accounts[0];
  const nonOwner = accounts[1];
  const oraclePosition = ethers.utils.id(
    "com.crypto.liquidETH.exchangeRateOracle"
  );
  const exchangeRatePosition = ethers.utils.id(
    "com.crypto.liquidETH.exchangeRate"
  );

  let stakedToken: LiquidETHV1Instance;

  beforeEach(async () => {
    stakedToken = await LiquidETHV1.new();
    await stakedToken.initialize(
      "CDC Wrapped Staked ETH",
      "cdcETH",
      "ETH",
      6,
      stakedTokenOwner,
      stakedTokenOwner,
      stakedTokenOwner,
      stakedTokenOwner
    );
    await stakedToken.initializeV2("CDC Wrapped Staked ETH");
  });

  describe("updateOracle", () => {
    it("should fail to update oracle when caller is not the owner", async () => {
      await expectRevert(
        stakedToken.updateOracle(stakedTokenOwner, { from: nonOwner }),
        "Ownable: caller is not the owner"
      );
    });
    it("should fail to update oracle when the new oracle is the zero address", async () => {
      await expectRevert(
        stakedToken.updateOracle(ZERO_ADDRESS),
        "LiquidETHV1: oracle is the zero address"
      );
    });
    it("should fail to update oracle when the new oracle is already the oracled", async () => {
      await stakedToken.updateOracle(stakedTokenOwner);
      await expectRevert(
        stakedToken.updateOracle(stakedTokenOwner),
        "LiquidETHV1: new oracle is already the oracle"
      );
    });
    it("should successfully update the oracle", async () => {
      expect(await stakedToken.oracle()).to.equal(ZERO_ADDRESS);
      let oracleStorage = await ethers.provider.getStorageAt(
        stakedToken.address,
        oraclePosition
      );
      expect(ethers.utils.hexDataSlice(oracleStorage, 12)).to.equal(
        ZERO_ADDRESS
      );
      const result = await stakedToken.updateOracle(stakedTokenOwner);
      const log = result.logs[0] as Truffle.TransactionLog<OracleUpdated>;
      expect(log.event).to.equal("OracleUpdated");
      expect(log.args[0]).to.equal(stakedTokenOwner);

      expect(await stakedToken.oracle()).to.equal(stakedTokenOwner);
      oracleStorage = await ethers.provider.getStorageAt(
        stakedToken.address,
        oraclePosition
      );
      expect(ethers.utils.hexDataSlice(oracleStorage, 12)).to.equal(
        stakedTokenOwner.toLowerCase()
      );
    });
  });
  describe("updateExchangeRate", () => {
    beforeEach(async () => {
      await stakedToken.updateOracle(stakedTokenOwner);
    });
    it("should fail to update exchange rate when the caller is not the oracle", async () => {
      await expectRevert(
        stakedToken.updateExchangeRate(stakedTokenOwner, { from: nonOwner }),
        "LiquidETHV1: caller is not the oracle"
      );
    });
    it("should fail to update the exchange rate when the new exchange rate is zero", async () => {
      await expectRevert(
        stakedToken.updateExchangeRate(0),
        "LiquidETHV1: new exchange rate cannot be 0"
      );
    });
    it("should successfully update the exchange rate", async () => {
      const newExchangeRate = 1;
      expect((await stakedToken.exchangeRate()).toNumber()).to.equal(0);
      let exchangeRateStorage = await ethers.provider.getStorageAt(
        stakedToken.address,
        exchangeRatePosition
      );
      expect(exchangeRateStorage).to.equal(ethers.constants.HashZero);
      const result = await stakedToken.updateExchangeRate(newExchangeRate);
      const log = result.logs[0] as Truffle.TransactionLog<ExchangeRateUpdated>;
      expect(log.event).to.equal("ExchangeRateUpdated");
      expect(log.args[0]).to.equal(stakedTokenOwner);
      expect(log.args[1].toNumber()).to.equal(newExchangeRate);

      expect((await stakedToken.exchangeRate()).toNumber()).to.equal(
        newExchangeRate
      );
      exchangeRateStorage = await ethers.provider.getStorageAt(
        stakedToken.address,
        exchangeRatePosition
      );
      expect(ethers.BigNumber.from(exchangeRateStorage).toNumber()).to.equal(
        newExchangeRate
      );
    });
  });
});
