// module.exports = async (hre) => {
//     const {getNamedAccounts, deployments} = hre
// }   

const { network } = require("hardhat")
const {network_config, development_chains} = require("../helper_hardhat_config")
const {verify} = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const {deploy, log, get} = deployments
    const {deployer} = await getNamedAccounts()
    const chain_id = network.config.chain_id

    let eth_usd_pf_address
    if (development_chains.includes(network.name)) {
        const eth_usd_agg = await get("MockV3Aggregator")
        eth_usd_pf_address = eth_usd_agg.address
    } else {
        eth_usd_pf_address = network_config[chain_id]["ethUsdPriceFeed"]
    }

    const args = eth_usd_pf_address 

    const fund_me = await deploy("FundMe", {
        from: deployer,
        args: [args],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1, 
    })

    if (!development_chains.includes(network.name) && process.env.ETHERSCAN_API_KEY ){
        await verify(fund_me.address, args)
    }

    log("--------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]