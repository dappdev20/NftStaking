import { createStore } from 'redux'
import Web3 from 'web3';
import config from '../config/index';
import { toast } from 'react-toastify';
import { BigNumber } from '@ethersproject/bignumber';

const _initialState = {
    account: "",
    rewardsPerUnitTime: 0,
    timeUnit: 1,
    totalBalance: 0,
    stakedTokens: [],
    unstakedTokens: [],
    amountStaked: 0,
    timeOfLastUpdate: 0,
    unclaimedRewards: 0,
    chainId: 97
};

const globalWeb3 = new Web3(config.mainNetUrl);
const provider = Web3.providers.HttpProvider(config.mainNetUrl);
const web3 = new Web3(Web3.givenProvider || provider);

const NFTStakeCon = new web3.eth.Contract(config.NFTStakeAbi, config.NFTStakeAddress);
const ERC721Con = new web3.eth.Contract(config.ERC721Abi, config.ERC721Address);

var NFTInfoDict = {};

console.log("Provider", config.mainNetUrl);
console.log("NFT staking contract", config.NFTStakeAddress);
console.log("ERC721 token contract", config.ERC721Address);

const mint = async (state) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        const valueToSend = web3.utils.toWei("0.001", "ether");
        await ERC721Con.methods.mint(1).send({ from: state.account, value: valueToSend });
        store.dispatch({ type: "GET_ACCOUNT_INFO" });
    } catch (e) {
        console.log(e);
    }
}

const stake = async (state, tokenIds) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        //tokenIds = await ERC721Con.methods.getMintedTokens(state.account).call();
        const numberArray = tokenIds.map((str) => parseInt(str, 10));
        // const bigNumerIds = BigNumber.from([tokenIds]);
        const isApproved = await ERC721Con.methods.isApprovedForAll(state.account, config.NFTStakeAddress).call();
        if (!isApproved)
            await ERC721Con.methods.setApprovalForAll(config.NFTStakeAddress, true).send({ from: state.account, gas: 1000000 });
        await NFTStakeCon.methods.stake(numberArray).send({ from: state.account, gas: 1000000 });
        store.dispatch({ type: "GET_ACCOUNT_INFO" });
    } catch (e) {
        console.log(e);
    }
}

const claim = async (state) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try {
        var tokenIds = await NFTStakeCon.methods.tokensOfOwner(state.account).call();
        const numberArray = tokenIds.map((str) => parseInt(str, 10));
        await NFTStakeCon.methods.claim(numberArray).send({ from: state.account, gas: 1000000 });
        store.dispatch({ type: "GET_ACCOUNT_INFO" });
    } catch (e) {
        console.log(e);
    }
}

const unstake = async (state, tokenIds) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        const numberArray = tokenIds.map((str) => parseInt(str, 10));
        await NFTStakeCon.methods.unstake(numberArray).send({ from: state.account, gas: 1000000 });
        store.dispatch({ type: "GET_ACCOUNT_INFO" });
    } catch (e) {
        console.log(e);
    }
}

const getAccountInfo = async (state) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    
    try {
        //var account = '0xdd89316929A975D7F65507BD3Cb4DD2f724ef07c';
        //var account = '0x79ca15110241605ae97f73583f5c3f140506fb80';
        var account = state.account;
        const valueToSend = web3.utils.toWei("0.001", "ether");
        var stakeInfo = await NFTStakeCon.methods.tokensOfOwner(account).call();

        var stakedTokens = [];
        for (let i = 0; i < stakeInfo.length; i++) {
            let tokenId = stakeInfo[i];
            if (!NFTInfoDict[tokenId]) {
                let tokenURI = await ERC721Con.methods.tokenURI(tokenId).call();
    
                let res = await fetch(tokenURI.replace("ipfs://", "https://coral-tragic-orangutan-191.mypinata.cloud/ipfs/"));
                res = await res.json();
                NFTInfoDict[tokenId] = {
                    url: res.image.replace("ipfs://", "https://coral-tragic-orangutan-191.mypinata.cloud/ipfs/"),
                    //name: res.name,
                    //description: res.description
                };
            }

            stakedTokens = [...stakedTokens, {
                id: tokenId,
                url: NFTInfoDict[tokenId].url,
                //name: NFTInfoDict[tokenId].name,
                //description: NFTInfoDict[tokenId].description
            }];
        }
        
        var allMintedNFTs = [];
        allMintedNFTs = await ERC721Con.methods.getMintedTokens(account).call();

        const mintNum = allMintedNFTs.length;
        var unstakedTokens = [];
        for (let i = 0; i < mintNum; i ++) {
            let tokenId = allMintedNFTs[i];
            if (!NFTInfoDict[tokenId]) {
                let tokenURI = await ERC721Con.methods.tokenURI(tokenId).call();
    
                let res = await fetch(tokenURI.replace("ipfs://", "https://coral-tragic-orangutan-191.mypinata.cloud/ipfs/"));
                res = await res.json();
                NFTInfoDict[tokenId] = {
                    url: res.image.replace("ipfs://", "https://coral-tragic-orangutan-191.mypinata.cloud/ipfs/"),
                };
            }
            if (!stakeInfo.includes(tokenId))
                unstakedTokens = [...unstakedTokens, {
                    id: tokenId,
                    url: NFTInfoDict[tokenId].url,
                //name: NFTInfoDict[tokenId].name,
                //description: NFTInfoDict[tokenId].description
                }];
        }

        store.dispatch({
            type: "RETURN_DATA",
            payload: {
                stakedTokens: stakedTokens,
                unstakedTokens: unstakedTokens,
                amountStaked: stakeInfo ? parseFloat(stakeInfo.length).toFixed(2) : 0,
                // timeOfLastUpdate: stakeInfo ? parseFloat(staker.timeOfLastUpdate).toFixed(2) : 0,
                // unclaimedRewards: stakeInfo ? globalWeb3.utils.fromWei(staker.unclaimedRewards.toString(), 'ether') : 0
            }
        });
    } catch (e) {
        console.log(e);
    }
}

const getContractInfo = async (state) => {
    if (!NFTStakeCon) {
        alertMsg("Please install metamask!");
        return;
    }

    try {
        var totalBalance = await NFTStakeCon.methods.balanceOf(state.account).call();
        totalBalance = globalWeb3.utils.fromWei(totalBalance.toString(), 'ether');

        var rewardsPerUnitTime = await NFTStakeCon.methods.getDailyReward().call();
        rewardsPerUnitTime = globalWeb3.utils.fromWei(rewardsPerUnitTime.toString(), 'ether');

        var timeUnit = await NFTStakeCon.methods.getTimeUnit().call();
        timeUnit = parseFloat(timeUnit).toFixed(2);


        store.dispatch({
            type: "RETURN_DATA",
            payload: {
                rewardsPerUnitTime: rewardsPerUnitTime,
                totalBalance: parseFloat(totalBalance).toFixed(2)
            }
        })
    } catch (e) {
        console.log(e);
    }
}

const reducer = (state = _initialState, action) => {
    switch (action.type) {
        case "GET_CONTRACT_INFO":
            getContractInfo(state);
            break;

        case "GET_ACCOUNT_INFO":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            getAccountInfo(state);
            break;

        case "MINT_TOKENS":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            mint(state);
            break;

        case "STAKE_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            stake(state, [action.payload.tokenId]);
            break;

        case "STAKE_ALL_TOKENS":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            stake(state, action.payload.tokenIds);
            break;

        case "CLAIM_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            claim(state);
            break;

        case "UNSTAKE_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            unstake(state, [action.payload.tokenId]);
            break;

        case "UNSTAKE_ALL_TOKENS":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            unstake(state, action.payload.tokenIds);
            break;

        case 'CONNECT_WALLET':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }

            web3.eth.getAccounts((err, accounts) => {
                if (accounts.length > 0) {
                    store.dispatch({
                        type: 'RETURN_DATA',
                        payload: { account: accounts[0] }
                    });

                    store.dispatch({ type: "GET_ACCOUNT_INFO" });
                }
            })
            break;

        case 'CHECK_NETWORK':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            return state;

        case 'RETURN_DATA':
            return Object.assign({}, state, action.payload);

        default:
            break;
    }
    return state;
}

const alertMsg = (msg) => {
    toast.info(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

const checkNetwork = (chainId) => {
    if (web3.utils.toHex(chainId) !== web3.utils.toHex(config.chainId)) {
        alertMsg("Change network to BSC Mainnet!");
        return false;
    } else {
        return true;
    }
}

const changeNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: config.chainId,
                            chainName: 'Avalanche',
                            rpcUrls: [config.mainNetUrl] /* ... */,
                        },
                    ],
                });
            } catch (addError) {
            }
        }
    }
}

if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length > 0) {
            store.dispatch({
                type: "RETURN_DATA",
                payload: {
                    account: accounts[0]
                }
            });
            store.dispatch({ type: "GET_ACCOUNT_INFO" });
        }
        else {
            store.dispatch({
                type: "RETURN_DATA",
                payload: {
                    account: "",
                    totalBalance: 0,
                    stakedTokens: [],
                    unstakedTokens: [],
                    amountStaked: 0,
                    timeOfLastUpdate: 0,
                    unclaimedRewards: 0
                }
            });
        }
    });

    window.ethereum.on('chainChanged', function (chainId) {
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    });

    web3.eth.getChainId().then((chainId) => {
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    })
}

const store = createStore(reducer);
export default store