pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Drop is Ownable {
    
    IERC20 public distribution_token;

    constructor(IERC20 token) Ownable() public {
        distribution_token = token;
    }

    function send(address[] calldata to_list, uint256[] calldata amount_list) external onlyOwner() {
        require(to_list.length == amount_list.length, "invalid length");
        require(to_list.length > 0, "length is zero");
        for(uint i = 0; i < to_list.length; ++i) {
            require(distribution_token.transfer(to_list[i], amount_list[i]), "failed transfer");
        }
    }

    function die() external onlyOwner() {
        require(distribution_token.transfer(msg.sender,distribution_token.balanceOf(address(this))), "failed transfer");
        selfdestruct(msg.sender);
    }
}