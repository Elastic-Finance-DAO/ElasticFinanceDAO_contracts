pragma solidity 0.5.0;
import "token-geyser/contracts/TokenGeyser.sol";

contract AmpleSenseGeyser is TokenGeyser {
    using SafeMath for uint256;

    event RebaseReward(uint256 amount, uint256 total);

    TokenPool private _rewardPool;

    //
    // Rebase-bonus params
    //
    uint256 public constant REBASE_BONUS_DECIMALS = 3;
    uint256 public bonusPositiveRebase = 0;
    uint256 public bonusNegativeRebase = 0;

    uint256 public totalRewardTokens = 0;
    
    //
    // Address of the AMPL contract
    //
    IERC20 public AMPLContract;

    //
    // Last AMPL total supply
    //
    uint256 lastAMPLTotalSupply;

    /**
     * @param stakingToken The token users deposit as stake.
     * @param distributionToken The token users receive as they unstake.
     * @param maxUnlockSchedules Max number of unlock stages, to guard against hitting gas limit.
     * @param startBonus_ Starting time bonus, BONUS_DECIMALS fixed point.
     *                    e.g. 25% means user gets 25% of max distribution tokens.
     * @param bonusPeriodSec_ Length of time for bonus to increase linearly to max.
     * @param initialSharesPerToken Number of shares to mint per staking token on first stake.
     * @param AMPLContractAddress Address of the uFragments Ampleforth ERC20
     * @param bonusPositiveRebase_ Bonus to apply on positive rebase
     * @param bonusNegativeRebase_ Bonus to apply on negative rebase
     */
    constructor(IERC20 stakingToken, IERC20 distributionToken, uint256 maxUnlockSchedules,
                uint256 startBonus_, uint256 bonusPeriodSec_, uint256 initialSharesPerToken,
                address AMPLContractAddress, uint256 bonusPositiveRebase_, uint256 bonusNegativeRebase_) public
        TokenGeyser(stakingToken, distributionToken, maxUnlockSchedules,
        startBonus_, bonusPeriodSec_, initialSharesPerToken) {
        require(bonusPositiveRebase_ <= 10**REBASE_BONUS_DECIMALS, 'TokenGeyser: rebase bonus too high');
        require(bonusNegativeRebase_ <= 10**REBASE_BONUS_DECIMALS, 'TokenGeyser: rebase bonus too high');
        require(AMPLContractAddress != address(0), "AMPLContractAddress cannot be the zero address");

        bonusPositiveRebase = bonusPositiveRebase_;
        bonusNegativeRebase = bonusNegativeRebase_;
        AMPLContract = IERC20(AMPLContractAddress);
        //init the last total supply to the AMPL total supply on creation
        lastAMPLTotalSupply = AMPLContract.totalSupply();
        _rewardPool = new TokenPool(distributionToken);
    }

    /**
    * Allows to add new reward tokens to the reward pool
    * Contract must be allowed to transfer this amount from the caller
    */
    function addRewardRebase(uint256 amount) external onlyOwner {
        totalRewardTokens = totalRewardTokens.add(amount);
        require(getDistributionToken().transferFrom(msg.sender, address(_rewardPool), amount),
            'TokenGeyser: transfer into reward pool failed');
    }

    /**
    * Public function to call after an Ampleforth AMPL token rebase
    * The function throws if the total supply of AMPL hasn't changed since the last call.
    */
    function rewardRebase() public {
        uint256 newTotalSupply = AMPLContract.totalSupply();
        require(newTotalSupply != lastAMPLTotalSupply, "Total supply of AMPL not changed");
        uint256 toTransfer = 0;
        if(newTotalSupply > lastAMPLTotalSupply) {
            toTransfer = totalRewardTokens.mul(bonusPositiveRebase).div(10**REBASE_BONUS_DECIMALS);
            
        } else {
            toTransfer = totalRewardTokens.mul(bonusNegativeRebase).div(10**REBASE_BONUS_DECIMALS);
        }
        //handle the last reward
        if(toTransfer > _rewardPool.balance())
            toTransfer = _rewardPool.balance();
        require(_rewardPool.transfer(address(_unlockedPool), toTransfer), 'TokenGeyser: transfer out of reward pool failed');
        lastAMPLTotalSupply = newTotalSupply;
        emit RebaseReward(toTransfer, _rewardPool.balance());
    }
}
