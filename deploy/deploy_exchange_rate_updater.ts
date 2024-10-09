import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deployFunction : DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, get } = hre.deployments;
  const { deployer, exchangeRateUpdaterOwner } = await hre.getNamedAccounts();

  const { address } = await deploy('ExchangeRateUpdater', {
      from: deployer,
      args: [],
      log: true,
  });

  const { address:proxyAddress } = await get("FiatTokenProxy");

  const exchangeRateUpdater = await ethers.getContractAt('ExchangeRateUpdater', address);
  const initializeTx = await exchangeRateUpdater.initialize(
    exchangeRateUpdaterOwner,
    proxyAddress,
  );
  console.log(`Call 'initialize' method on ExchangeRateUpdater contract (tx: ${initializeTx.hash})...`);
  await initializeTx.wait();

  return true;
};

export default deployFunction;
deployFunction.id = "ExchangeRateUpdater";
deployFunction.tags = ['ExchangeRateUpdater'];
deployFunction.dependencies = ['FiatTokenProxy'];
