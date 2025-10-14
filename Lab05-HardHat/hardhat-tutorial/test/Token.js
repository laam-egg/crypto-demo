const { expect } = require("chai");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    /**
     * A Signer in ethers.js is an object that represents an Ethereum account.
     * It's used to send transactions to contracts and other accounts. Here
     * we're getting a list of the accounts in the node we're connected to,
     * which in this case is Hardhat Network, and we're only keeping the first
     * one.
     * 
     * The ethers variable is available in the global scope. If you like your
     * code always being explicit, you can add this line at the top:
     *      const { ethers } = require("hardhat");
     * 
     * TIP: To learn more about Signer, you can look at the Signer documentation
     * <https://docs.ethers.org/v6/api/providers/#Signer>.
     */
    const [owner] = await ethers.getSigners();

    /**
     * Calling `ethers.deployContract("Token")` will start the deployment of
     * our token contract, and return a Promise that resolves to a Contract.
     * This is the object that has a method for each of your smart contract
     * functions.
     * In short: `hardhatToken` is a JavaScript object that represents
     * the deployed smart contract, from which we can call our contract's
     * functions.
     */
    const hardhatToken = await ethers.deployContract("Token");

    /**
     * Once the contract is deployed, we can call our contract methods on
     * `hardhatToken`. Here we get the balance of the owner account by
     * calling the contract's balanceOf() method.
     */
    const ownerBalance = await hardhatToken.balanceOf(owner.address);

    /**
     * Recall that the account that deploys the token gets its entire supply.
     * By default, Contract instances are connected to the first signer.
     * This means that the account in the `owner` variable is the one that
     * executed the deployment, and balanceOf() should return the ENTIRE
     * supply amount.
     * 
     * So here, we're again using our Contract instance to call a smart
     * contract function in our Solidity code. totalSupply() returns the
     * token's supply amount (i.e. the totalSupply variable in our Token.sol
     * file) and we're checking that it's equal to `ownerBalance`, as
     * it should be.
     */
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);

    /**
     * To do this we're using Chai which is a popular JavaScript assertion
     * library. These asserting functions are called "matchers", and the
     * ones we're using here come from the @nomicfoundation/hardhat-chai-matchers
     * plugin, which extends Chai with many matchers useful to test smart
     * contracts.
     */
  });



  /**
   * USING A DIFFERENT ACCOUNT
   * 
   * If you need to test your code by sending a transaction from an account
   * (or Signer in ethers.js terminology) other than the default one, you
   * can use the `connect()` method on your ethers.js Contract object to
   * connect it to a different account, like this:
   */
  it("Should transfer tokens between accounts", async function() {
    const [_owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract("Token");

    // Transfer 50 tokens from owner to addr1
    await hardhatToken.transfer(addr1.address, 50);
    expect(await hardhatToken.balanceOf(addr1.address)).to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    await hardhatToken.connect(addr1).transfer(addr2.address, 50);
    expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
    expect(await hardhatToken.balanceOf(addr1.address)).to.equal(0);
  });
});
