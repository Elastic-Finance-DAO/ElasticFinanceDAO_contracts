const TokenGeyser = artifacts.require('./AmpleSenseGeyser.sol');
const uFragments = artifacts.require('./uFragments.sol');
const KMPL = artifacts.require('./KiloAmple.sol');


module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {

    let mainAccount = accounts[0];
    await deployer.deploy(uFragments, {from : mainAccount});
    await deployer.deploy(KMPL, {from : mainAccount});
    let ampl = await uFragments.deployed();
    await ampl.initialize(mainAccount, {from : mainAccount});
    let kmpl = await KMPL.deployed();
    //deploying kGeyser1 AMPL-kMPL
    //reaches max bonus in 14 days
    await deployer.deploy(TokenGeyser,ampl.address,kmpl.address,2,20,14*24*60*60,1000000,ampl.address,10,5, {from : mainAccount});
    let kGeyser1 = await TokenGeyser.deployed();
    //setup kGeyser1
    //approve kGeyser1 to extract 23714 tokens
    await kmpl.approve(kGeyser1.address, 23714*1000000000, {from : mainAccount});
    //Bucket A
    await kGeyser1.lockTokens(17793*1000000000, 90*24*60*60, {from : mainAccount});
    //Bucket B with 1% and 0.5% as rebase bonuses
    return await kGeyser1.addRewardRebase(5921*1000000000, {from : mainAccount});
  })
};