// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("Token 104087", "TLB104087") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}