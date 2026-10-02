// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {WrappedToken} from "./WrappedToken.sol";

contract DestinationBridge is Ownable, Pausable {

    WrappedToken public immutable wrapped;

    // Ai duoc phep lam relayer
    mapping(address => bool) public relayers;

    // Message nao da duoc xu ly
    mapping(bytes32 => bool) public processed;

    error NotRelayer();
    error AlreadyProcessed(bytes32 messageId);

    event TokensMinted(
        bytes32 indexed messageId,
        address indexed to,
        uint256 amount
    );

    constructor(address wrapped_, address owner_)
        Ownable(owner_)
    {
        wrapped = WrappedToken(wrapped_);
    }

    modifier onlyRelayer() {
        if (!relayers[msg.sender]) revert NotRelayer();
        _;
    }

    function mintFromSource(
        bytes32 messageId,
        address to,
        uint256 amount
    )
        external
        onlyRelayer
        whenNotPaused
    {
        if (processed[messageId]) {
            revert AlreadyProcessed(messageId);
        }

        // Ghi trang thai truoc
        processed[messageId] = true;

        // Sau do moi mint
        wrapped.mint(to, amount);

        emit TokensMinted(messageId, to, amount);
    }

    function setRelayer(address r, bool ok) external onlyOwner {
        relayers[r] = ok;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}