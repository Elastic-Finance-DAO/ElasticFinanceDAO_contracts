const { contract, web3 } = require('@openzeppelin/test-environment');
const { expectRevert, expectEvent, BN, constants } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const _require = require('app-root-path').require;
const BlockchainCaller = _require('/util/blockchain_caller');
const chain = new BlockchainCaller(web3);
const {
  $AMPL,
  invokeRebase,
  TimeController
} = _require('/test/helper');

const AmpleforthErc20 = contract.fromArtifact('UFragments');
const TokenGeyser = contract.fromArtifact('TokenGeyser');
const InitialSharesPerToken = 10 ** 6;

let ampl, dist, owner, anotherAccount;
describe('rebasing bonus', function () {
  const timeController = new TimeController();
  beforeEach('setup contracts', async function () {
    const accounts = await chain.getUserAccounts();
    owner = web3.utils.toChecksumAddress(accounts[0]);
    anotherAccount = web3.utils.toChecksumAddress(accounts[8]);

    ampl = await AmpleforthErc20.new();
    await ampl.initialize(owner);
    await ampl.setMonetaryPolicy(owner);

    const startBonus = 50;
    const bonusPeriod = 86400;
    dist = await TokenGeyser.new(ampl.address, ampl.address, 10, startBonus, bonusPeriod,
      InitialSharesPerToken, ampl.address);
    expect(await dist.totalStaked.call()).to.be.bignumber.equal($AMPL(0));
    await ampl.transfer(anotherAccount, $AMPL(50));
    await ampl.approve(dist.address, $AMPL(50), {
      from: anotherAccount
    });
    await dist.stake($AMPL(50), [], {
      from: anotherAccount
    });

  });

  it('no reward if no buckets with rebase rewards', async function() {
    await ampl.approve(dist.address, $AMPL(150));
    await dist.lockTokens($AMPL(150),200,0,0);
    await invokeRebase(ampl, 100);
    let res = await dist.rewardRebase();
    let l = res.logs.filter(l => l.event === 'TokensUnlocked');
    expect(l.length === 0);
  })

  it('no price change rebase', async function() {
    await ampl.approve(dist.address, $AMPL(100));
    await dist.lockTokens($AMPL(100),200,10,5);
    await invokeRebase(ampl, 0);
    await expectRevert(
      dist.rewardRebase(),
      'Total supply of AMPL not changed'
    );
  })

  it('no rebase', async function() {
    await ampl.approve(dist.address, $AMPL(100));
    await dist.lockTokens($AMPL(100),200,10,5);
    await expectRevert(
      dist.rewardRebase(),
      'Total supply of AMPL not changed'
    );
  })

  it('positive rebase', async function() {
    await ampl.approve(dist.address, $AMPL(100));
    await dist.lockTokens($AMPL(100),200,10,5);
    await invokeRebase(ampl, 10);
    let res = await dist.rewardRebase();
    expectEvent(res, 'ScheduleRebaseReward', {
      id: "0",
      bonusShares: "1000000000000000"
    });
  })

  it('negative rebase', async function() {
    await ampl.approve(dist.address, $AMPL(100));
    await dist.lockTokens($AMPL(100),200,10,5);
    await invokeRebase(ampl, -10);
    let res = await dist.rewardRebase();
    expectEvent(res, 'ScheduleRebaseReward', {
      id: "0",
      bonusShares: "500000000000000"
    });
  })

});
