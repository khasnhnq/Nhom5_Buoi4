// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SourceBridge is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public nonce;

    event TokensLocked(
        bytes32 indexed messageId,
        address indexed from,
        address to,
        uint256 amount,
        uint256 destChainId
    );

    constructor(address token_, address owner_) Ownable(owner_) {
        token = IERC20(token_);
    }

    error InvalidAmount();

    function lock(
        address to,
        uint256 amount,
        uint256 destChainId
    ) external {
        if (amount == 0 || to == address(0)) revert InvalidAmount();

        token.safeTransferFrom(msg.sender, address(this), amount);

        bytes32 messageId = keccak256(
            abi.encode(
                block.chainid,
                destChainId,
                msg.sender,
                to,
                amount,
                nonce
            )
        );

        emit TokensLocked(
            messageId,
            msg.sender,
            to,
            amount,
            destChainId
        );

        unchecked {
            nonce++;
        }
    }
}