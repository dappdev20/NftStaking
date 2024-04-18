// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ISAPE.sol";
import "./libraries/SafeMath.sol";

contract SalchainToken is ISAPE {
    using SafeMath for uint256;

    string  public  name;
    string  public  symbol;
    uint8   public  decimals;
    uint256 public  totalSupply_;

    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;

    uint256 buyFee = 2;
    uint256 sellFee = 5;
    address swapPair;

    constructor() {
        name = "NFT-Reward-Token";
        symbol = "SAPE";
        decimals = 18;
        totalSupply_ = 10000000000000000000000;     // total tokens would equal (totalSupply_/10**decimals)=10000
        balances[msg.sender] = totalSupply_;
    }

    function mint(address account, uint256 amount) public {
        require(account != address(0), "SAPE: mint to the zero address");

        balances[account] = balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    function totalSupply() public override view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function setPairAddress(address pair) public {
        swapPair = pair;
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        uint256 feeAmount = 0;
        if (receiver == swapPair) {
            feeAmount = numTokens * sellFee / 100;
        } else if (msg.sender == swapPair) {
            feeAmount = numTokens * buyFee / 100;
        }
        balances[msg.sender] = balances[msg.sender].sub(numTokens - feeAmount);
        balances[receiver] = balances[receiver].add(numTokens - feeAmount);
        emit Transfer(msg.sender, receiver, numTokens - feeAmount);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        uint256 feeAmount = 0;
        if (buyer == swapPair) {
            feeAmount = numTokens * sellFee / 100;
        } else if (owner == swapPair) {
            feeAmount = numTokens * buyFee / 100;
        }
        balances[owner] = balances[owner].sub(numTokens - feeAmount);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens).sub(feeAmount);
        balances[buyer] = balances[buyer].add(numTokens - feeAmount);
        emit Transfer(owner, buyer, numTokens);
        return true;
    }
}