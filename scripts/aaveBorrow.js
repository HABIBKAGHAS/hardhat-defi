const { getNamedAccounts } = require("hardhat");
const { getWeth } = require("./getWeth");

async function main() {
    await getWeth();
    const { deployer } = await getNamedAccounts();

    // lending pool address provider  0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
}

async function getLendingPool() {}

main()
    .then()
    .catch((err) => {
        console.log(err);
    });
