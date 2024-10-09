import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const deployFunction : DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("deployer")

  const { deploy } = hre.deployments;
  const { deployer, tokenOwner } = await hre.getNamedAccounts();

  let admin = null;
  let ownerAndOthers = Array(5).fill(null);
  if (hre.network.config.chainId == 338) {
    admin = "0x23e57ff611f1850dcf8b729add2f8202c0fd0aa0"
    ownerAndOthers = Array(5).fill("0x01bd877496bfd70f5b244072045b584a7303d306")
  }
  else if (hre.network.config.chainId == 25) {
    admin = "0xb94baf66fdbfdf1c2413ad4feb0be4810d890dc1"
    ownerAndOthers = Array(5).fill("0x6392aadd46a6957cee6ee39c23d8315d8c4e657e")
  }
  else if (hre.network.config.chainId == 17000) {
    admin = "0x1d8ff8df4e52964e820b67332af35fa2d72f3048"
    ownerAndOthers = Array(5).fill("0x4787a9810599b233874175089ddc15f96f043d9c")
  }
  else {
    throw new Error("Unsupported network");
  }

  const [masterMinter, pauser, blacklister, newTokenOwner, lostAndFound] = ownerAndOthers;

  console.log("masterMinter: ", masterMinter);
  console.log("pauser: ", pauser);
  console.log("blacklister: ", blacklister);
  console.log("newTokenOwner: ", newTokenOwner);
  console.log("lostAndFound: ", lostAndFound);
  console.log("admin: ", admin);
  const { address: implementAddress, abi: implementABI } = await deploy('LiquidETHV1', {
      from: deployer,
      args: [],
      log: true,
  });

  console.log("deployer: ", deployer);
  console.log("tokenOwner: ", tokenOwner);

  //  await delay(5000);

  const { address: proxyAddress } = await deploy('FiatTokenProxy', {
    from: deployer,
    args: [implementAddress],
    log: true,
  });

  // initialize StakedToken
  const tokenOwnerSigner = await ethers.getSigner(tokenOwner);
  const fiatTokenProxy = await ethers.getContractAt(implementABI, proxyAddress, tokenOwnerSigner);

  //  await delay(5000);

  const initializeTx = await fiatTokenProxy.initialize(
    "Crypto.com Wrapped Staked ETH", // string memory tokenName
    "CDCETH", // string memory tokenSymbol
    "", // string memory tokenCurrency TODO: Can it be empty string? or 'ETH'
    18, // uint8 tokenDecimals
    masterMinter, // address newMasterMinter
    pauser, // address newPauser
    blacklister, // address newBlacklister
    tokenOwner, // address newOwner
  );
  console.log(`Call 'initialize' method on FiatTokenProxy(LiquidETHV1) contract (tx: ${initializeTx.hash})...`);
  await initializeTx.wait();

  //  await delay(5000);
  // TODO: do we need all initialize calls?
  const initializeV2Tx = await fiatTokenProxy.initializeV2(
    "Crypto.com Wrapped Staked ETH", // string calldata newName
  );
  console.log(`Call 'initializeV2' method on FiatTokenProxy(LiquidETHV1) contract (tx: ${initializeV2Tx.hash})...`);
  await initializeV2Tx.wait();

  //  await delay(5000);

  const initializeV2U1Tx = await fiatTokenProxy.initializeV2_1(
    lostAndFound, // address lostAndFound
  );
  console.log(`Call 'initializeV2_1' method on FiatTokenProxy(LiquidETHV1) contract (tx: ${initializeV2U1Tx.hash})...`);
  await initializeV2U1Tx.wait();

  //  await delay(5000);

  const transferOwnershipTx = await fiatTokenProxy.transferOwnership(
    newTokenOwner
  );
  console.log(`Call 'transferOwnership' method on FiatTokenProxy(LiquidETHV1) contract (tx: ${transferOwnershipTx.hash})...`);
  await transferOwnershipTx.wait();

  //  await delay(5000);

  const originalProxy = await ethers.getContractAt('FiatTokenProxy', proxyAddress);
  const changeAdminTx = await originalProxy.changeAdmin(admin);
  console.log(`Call 'changeAdmin' method on FiatTokenProxy contract (tx: ${changeAdminTx.hash})...`);
  await changeAdminTx.wait();
  
  //  await delay(5000);

  const liquidETHV1Implementation = await ethers.getContractAt(implementABI, implementAddress);
  const transferOwnershipOfImplTx =  await liquidETHV1Implementation.transferOwnership(admin)
  await transferOwnershipOfImplTx.wait();

  return true;
};

export default deployFunction;
deployFunction.id = "FiatTokenProxy";
deployFunction.tags = ['FiatTokenProxy'];
