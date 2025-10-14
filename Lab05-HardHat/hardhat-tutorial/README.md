# Hardhat Tutorial: Key Notes

## Commands

- `npx hardhat` : show all available commands
- `npx hardhat help` : show help for Hardhat
- `npx hardhat help <command>` : show help for a specific command
- `npx hardhat compile` : compile the smart contracts
- `npx hardhat test` : run the tests
- `npx hardhat node` : start a local Ethereum network
- `npx hardhat run <script>` : run a script on the local network
- `npx hardhat run <script> --network <network-name>` : run a script on a specific network
- `npx hardhat clean` : clean the cache and delete all artifacts
- `npx hardhat accounts` : show the list of accounts

## 6. Debugging with Hardhat Network

<https://v2.hardhat.org/tutorial/debugging-with-hardhat-network>

Hardhat comes built-in with Hardhat Network, a local Ethereum
network designed for development. It allows you to deploy your
contracts, run your tests and debug your code, all within the
confines of your local machine. It's the default network that
Hardhat connects to, so you don't need to set up anything for
it to work. Just run your tests.

When running your contracts and tests on Hardhat Network, you
can print logging messages and contract variables by calling
`console.log()` from your Solidity code. To use it you have
to import hardhat/console.sol in your contract code.

```solidity
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
  //...
}
```

Then you can just add some console.log calls to the `transfer()`
function as if you were using it in JavaScript. The logging output
will show when you run your tests.
