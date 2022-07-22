const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("./getWeth");

async function main() {
    await getWeth();
    const { deployer } = await getNamedAccounts();

    const lendingPool = await getLendingPool(deployer);
    console.log(lendingPool.address);

    // lending pool address provider  0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5

    //Depositing....
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    await apprpoveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("depositing....");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("deposited!");

    //Borrowing....
    let { totalCollateralETH, totalDeptETH, availableBorrowsETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );

    const daiPrice = await getDaiPrice();

    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());

    console.log("you can borrow: " + amountDaiToBorrow);
    console.log("you can borrow in wei: " + amountDaiToBorrowWei);

    await borrowDai(
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    );
    console.log("borrowed!");
    //Borrowing....
    let s = await getBorrowUserData(lendingPool, deployer);

    await repay(
        amountDaiToBorrowWei,
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        lendingPool,
        deployer
    );

    await getBorrowUserData(lendingPool, deployer);
}

async function repay(amount, daiAddress, lendingPool, account) {
    await apprpoveErc20(daiAddress, lendingPool.address, amount, account);
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
    await repayTx.wait(1);

    console.log("repaid");
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account);

    await borrowTx.wait(1);

    console.log("you have borrowed!");
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    );

    const daiPrice = (await daiEthPriceFeed.latestRoundData())[1];
    console.log("dai price: " + daiPrice.toString());
    return daiPrice;
}

async function getBorrowUserData(lendingPool, account) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH
    } = await lendingPool.getUserAccountData(account);
    console.log("you can borrow: " + availableBorrowsETH.toString());
    console.log("you have borrowed: " + totalDebtETH.toString());
    console.log("you have collateral: " + totalCollateralETH.toString());

    return {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH
    };
}

async function apprpoveErc20(erc20address, spenderAddress, amountToSpent, account) {
    const erc20 = await ethers.getContractAt("IERC20", erc20address, account);
    const tx = await erc20.approve(spenderAddress, amountToSpent);
    await tx.wait(1);
    console.log("Approved !");
}

async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    );
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
    const lendigPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
    return lendigPool;
}

main()
    .then()
    .catch(err => {
        console.log(err);
    });
