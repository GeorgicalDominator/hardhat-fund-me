const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
        let fundMe
        let deployer
        let mockV3Aggregator
        const send_value = ethers.utils.parseEther("1")
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
        })

        describe("Constructor", async () => {

            it("sets the aggregator addresses correctly", async () => {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("Fund", async() => {
            it("fails if you dont send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.reverted
            })
            
            it("updated the amount funded data structure", async () => {
                await fundMe.fund({value:send_value})
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), send_value.toString())
            })
            
            it("should add funder to getFunder array", async () => {
                await fundMe.fund({value:send_value})
                const funder = await fundMe.getFunder(0)
                assert.equal(funder, deployer)
            })


        })

        describe("Withdraw", async () => {

            beforeEach(async () => {
                await fundMe.fund({value: send_value})
            })

            it("withdraw ETH from a single founder", async () => {
                const start_balance = await fundMe.provider.getBalance(fundMe.address)
                const start_deployer_balance = await fundMe.provider.getBalance(deployer)

                const tr_resp = await fundMe.withdraw()
                const tr_receipt = await tr_resp.wait(1)
                const {gasUsed, effectiveGasPrice} = tr_receipt
                const gas_cost = gasUsed.mul(effectiveGasPrice)

                const end_balance = await fundMe.provider.getBalance(fundMe.address)
                const end_deployer_balance = await fundMe.provider.getBalance(deployer)

                assert.equal(end_balance,0)
                assert.equal(start_balance.add(start_deployer_balance).toString(), end_deployer_balance.add(gas_cost).toString())
            })
            
            it("allows us to withdraw with multiple getFunder", async () => {
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMe_connected_contract = await fundMe.connect(accounts[i])
                    await fundMe_connected_contract.fund({value: send_value})
                }
                const start_balance = await fundMe.provider.getBalance(fundMe.address)
                const start_deployer_balance = await fundMe.provider.getBalance(deployer)

                const tr_resp = await fundMe.withdraw()
                const tr_receipt = await tr_resp.wait(1)
                const {gasUsed, effectiveGasPrice} = tr_receipt
                const gas_cost = gasUsed.mul(effectiveGasPrice)

                await expect(fundMe.getFunder(0)).to.be.reverted

                for(i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })

            it("only allows owner to withdraw", async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attacker_connected_contract = await fundMe.connect(attacker)
                await expect(attacker_connected_contract.withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
            })

        })

        describe("cheaper_Withdraw", async () => {

            beforeEach(async () => {
                await fundMe.fund({value: send_value})
            })

            it("cheaper_withdraw ETH from a single founder", async () => {
                const start_balance = await fundMe.provider.getBalance(fundMe.address)
                const start_deployer_balance = await fundMe.provider.getBalance(deployer)

                const tr_resp = await fundMe.cheaper_withdraw()
                const tr_receipt = await tr_resp.wait(1)
                const {gasUsed, effectiveGasPrice} = tr_receipt
                const gas_cost = gasUsed.mul(effectiveGasPrice)

                const end_balance = await fundMe.provider.getBalance(fundMe.address)
                const end_deployer_balance = await fundMe.provider.getBalance(deployer)

                assert.equal(end_balance,0)
                assert.equal(start_balance.add(start_deployer_balance).toString(), end_deployer_balance.add(gas_cost).toString())
            })
            
            it("allows us to cheaper_withdraw with multiple getFunder", async () => {
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMe_connected_contract = await fundMe.connect(accounts[i])
                    await fundMe_connected_contract.fund({value: send_value})
                }
                const start_balance = await fundMe.provider.getBalance(fundMe.address)
                const start_deployer_balance = await fundMe.provider.getBalance(deployer)

                const tr_resp = await fundMe.cheaper_withdraw()
                const tr_receipt = await tr_resp.wait(1)
                const {gasUsed, effectiveGasPrice} = tr_receipt
                const gas_cost = gasUsed.mul(effectiveGasPrice)

                await expect(fundMe.getFunder(0)).to.be.reverted

                for(i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
                }
            })

        })

    })