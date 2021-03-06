import { ethers } from "ethers";
import { ERC20_TRANSFER_EVENT_SIG } from "@tomfrench/matic-proofs";
import { provider } from "./constants";
import UsdcAbi from "./abi/USDC.json";

const burnAddress = "0x0000000000000000000000000000000000000000";

/**
 * @function getLastBurnTxHash - Gets the last burn transaction hash for a given address
 * @param {string} address - the customer's Polymarket account address
 * @returns {string} - the transaction hash
 * */
export const getLastBurnTxHash = async (
    address: string,
): Promise<Array<string>> => {
    const toBlock = await provider.getBlockNumber();
    const fromBlock = toBlock - 500000;

    const logs: Array<any> = await provider.getLogs({
        fromBlock,
        toBlock,
        topics: [
            ERC20_TRANSFER_EVENT_SIG,
            ethers.utils.hexZeroPad(address, 32),
            ethers.utils.hexZeroPad(burnAddress, 32),
        ],
    });

    const iface = new ethers.utils.Interface(UsdcAbi);
    const decodedData = iface.decodeEventLog(
        ERC20_TRANSFER_EVENT_SIG,
        logs[logs.length - 1].data,
    );
    const value = decodedData.value.toString();
    const lastBurnTransactionHash = logs[logs.length - 1].transactionHash;
    return [lastBurnTransactionHash, value];
};

/**
 * @function USDCFormat - formats a USDC BigNumber string for display
 * @params {bigNUmberString} - string resulting from calling toString() on a BigNumber value retrieve from USDC contract
 * @returns {string} - the formated string
 */
export const USDCFormat = (bigNumberString: string): string => {
    const digits = bigNumberString.slice(0, -6);
    const decimals = bigNumberString.slice(bigNumberString[1].length - 8, -1);
    const digitsWithCommas = digits.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
    return `$${digitsWithCommas}.${decimals}`;
};
