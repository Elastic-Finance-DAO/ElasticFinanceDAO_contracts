pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/**
 * @title KMPL ERC20 token
 */
contract KiloAmple is ERC20Detailed, ERC20 {
    string private constant TOKEN = "KiloAmple";
    string private constant SYMBOL = "kMPL";
    uint256 private constant DECIMALS = 9;
    uint256 private constant TOTAL_SUPPLY = 50000 * 10**DECIMALS;

    constructor()  ERC20Detailed(TOKEN, SYMBOL, uint8(DECIMALS)) public {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
}