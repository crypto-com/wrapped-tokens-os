import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployFunction : DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, get } = hre.deployments;
  const { deployer, mintForwarderOwner } = await hre.getNamedAccounts();

  const { address } = await deploy('MintForwarder', {
      from: deployer,
      args: [],
      log: true,
  });

  const { address:proxyAddress } = await get("FiatTokenProxy");

  const mintForwarder = await ethers.getContractAt('MintForwarder', address);
  const initializeTx = await mintForwarder.initialize(
    mintForwarderOwner,
    proxyAddress,
  );
  console.log(`Call 'initialize' method on MintForwarder contract (tx: ${initializeTx.hash})...`);
  await initializeTx.wait();

  return true;
};

export default deployFunction;
deployFunction.id = "MintForwarder";
deployFunction.tags = ['MintForwarder']
deployFunction.dependencies = ['FiatTokenProxy']
