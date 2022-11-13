const {run} = require("hardhat")

const verify = async (contractAdress, args) => {
    Console.log("Verifying contract")
    try {
        await run("verify:verify", {
            address: contractAdress,
            ConstructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = {verify}