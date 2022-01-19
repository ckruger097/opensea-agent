import BigNumber from "bignumber.js";

const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const {
    WYVERNEXCHANGE_ADDRESS,
    ORDERSMATCHED_EVENT,
    ETH_DECIMALS,
} = require("./constants")

// 2 ETH is usual threshold for valuable NFTs
const HIGHVALUE_THRESHOLD = "2"

function providerEventTransaction(highvalueThreshold) {
    return async function handleTransaction(txEvent) {
        const findings = [];

        const highValueNFTSaleEvent = txEvent.filterLog(
            ORDERSMATCHED_EVENT,
            WYVERNEXCHANGE_ADDRESS,
        );

        highValueNFTSaleEvent.forEach((highValueNFTSale) => {
            const salePrice = new BigNumber(
                highValueNFTSale.args.value.toString()
            ).dividedBy(10 ** ETH_DECIMALS);

            if (salePrice.isLessThan(HIGHVALUE_THRESHOLD)) return;

            const formattedAmount = salePrice.toFixed(2);
            findings.push(
                Finding.fromObject({
                    name: "High Value NFT Sale",
                    description: `${formattedAmount} ETH sale`,
                    alertID: "FORTA-99",
                    severity: FindingSeverity.Info,
                    type: FindingType.Info,
                    metadata: {
                        buyHash: highValueNFTSale.args.buyHash,
                        sellHash: highValueNFTSale.args.sellhash,
                        maker: highValueNFTSale.maker,
                        taker: highValueNFTSale.taker,
                        price: formattedAmount,
                        metadata: highValueNFTSale.metadata,
                    },
                })
            );
        });
        return findings;
    };
}

module.exports = {
    providerEventTransaction,
    handleTransaction: providerEventTransaction(HIGHVALUE_THRESHOLD),
}