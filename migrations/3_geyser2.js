const TokenGeyser = artifacts.require('./TokenGeyser.sol');
const uFragments = artifacts.require('./uFragments.sol');
const KMPL = artifacts.require('./KiloAmple.sol');


module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let mainAccount = accounts[0];

    let ampl = await uFragments.deployed();
    let kmpl = await KMPL.deployed();
    //deploying kGeyser2 WETH-kPML
    //reaches max bonus in 90 days
    await deployer.deploy(TokenGeyser,ampl.address,kmpl.address,2,33,90*24*60*60,1000000,ampl.address, {from : mainAccount});
    let kGeyser2 = await TokenGeyser.deployed();
    //setup kGeyser2
    //approve kGeyser2 to extract 12774 tokens
    await kmpl.approve(kGeyser2.address, 12774*1000000000, {from : mainAccount});
    //Bucket A
    await kGeyser2.lockTokens(9581*1000000000, 90*24*60*60, 0, 0, {from : mainAccount});
    //Bucket B with 1% and 0.5% as rebase bonuses
    return await kGeyser2.lockTokens(3193*1000000000, 90*24*60*60, 10, 5, {from : mainAccount});
  })
};