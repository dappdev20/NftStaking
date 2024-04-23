// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./libraries/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract SalchainToken is ERC20 {
    using SafeMath for uint256;

    uint8   private  decimals;
    uint256 public  totalSupply_;

    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;

    uint256 private buyFee = 2;
    uint256 private sellFee = 5;
    address private feeTo;
    address private swapPair;
    address private router;

    constructor() ERC20("NFT-Reward-Token", "SAPE") {
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

    function getPairAddress() public view returns (address) {
        return swapPair;
    }

    function setPairAddress(address pair) public {
        swapPair = pair;
    }

    function setFeeTo(address _feeToAddr) public {
        feeTo = _feeToAddr;
    }

    function setRouter(address _routerAddr) public {
        router = _routerAddr;
    }

    function _transfer(
        address sender_,
        address recipient_,
        uint256 amount_
    ) internal virtual override {
        if (sender_ == address(this)) {
            super._transfer(sender_, recipient_, amount_);
        } else {
            uint256 feeAmount = 0;
            if (recipient_ == swapPair) {
                feeAmount = amount_ * sellFee / 100;
            } else if (sender_ == swapPair) {
                feeAmount = amount_ * buyFee / 100;
            }
            uint amt = amount_ - feeAmount;
            
            super._transfer(sender_, address(this), feeAmount);

            if (sender_ != swapPair) {
                _distributeFee();
            }

            super._transfer(sender_, recipient_, amt);
        }
    }

    function _distributeFee() internal {
        uint amount = balanceOf(address(this));
        if (amount > 0) {
            _swapTokensForETH(amount);
        }
    }

    function _swapTokensForETH(uint256 amount_) internal {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = _weth9;
        _approve(address(this), address(router), amount_);
        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amount_,
            0,
            path,
            feeTo,
            block.timestamp
        );
    }
}