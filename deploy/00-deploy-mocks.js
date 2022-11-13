const {development_chains, DECIMALS, INITIAL_ANSWER} = require("../helper_hardhat_config")


module.exports = async ({ getNamedAccounts, deployments }) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()

    if (development_chains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks dployed!")
        log("--------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]