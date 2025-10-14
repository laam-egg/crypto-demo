/**
 * REUSING COMMON TEST SETUPS WITH FIXTURES
 * 
 * The two tests that we wrote (in Token.js) begin with their
 * setup, which in this case means deploying the token contract.
 * In more complex projects, this setup could involve multiple
 * deployments and other transactions. Doing that in every test
 * means a lot of code duplication. Plus, executing many
 * transactions at the beginning of each test can make the test
 * suite much slower.
 * 
 * You can avoid code duplication and improve the performance
 * of your test suite by using **fixtures**. A fixture is a
 * setup function that is run only the first time it's invoked.
 * On subsequent invocations, instead of re-running it, Hardhat
 * will reset the state of the network to what it was at the
 * point after the fixture was initially executed.
 */
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Token contract", function () {
    /**
     * Here we wrote a deployTokenFixture function that does
     * the necessary setup and returns every value we use later
     * in the tests. Then in each test, we use `loadFixture`
     * to run the fixture and get those values. `loadFixture`
     * will run the setup the first time, and quickly *return*
     * to that state in the other tests.
     */
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const hardhatToken = await ethers.deployContract("Token");

        // Fixtures can return anything you consider useful for your tests
        return { hardhatToken, owner, addr1, addr2 };
    }






    it("Should assign the total supply of tokens to the owner", async function () {
        const { hardhatToken, owner } = await loadFixture(deployTokenFixture); // so, specify the fixture/setup function here.

        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should transfer tokens between accounts", async function () {
        const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

        /**
         * Note that the semantics here haven't changed ; we just
         * use some Chai matchers provided by Hardhat to make
         * the tests more expressive, e.g. `to.changeTokenBalances`.
         */

        // Transfer 50 tokens from owner to addr1
        await expect(
            hardhatToken.transfer(addr1.address, 50)
        ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, +50]);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await expect(
            hardhatToken.connect(addr1).transfer(addr2.address, 50)
        ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, +50]);
    });
});
