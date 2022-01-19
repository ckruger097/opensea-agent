const BigNumber = require("bignumber.js");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const highValueEventAgent = require("./highvalue_orders_events");

let findingsCount = 0;

function provideHandleTransaction(
    highValueEventAgent,
) {
    return async function handleTransaction(txEvent) {
        // limiting this agent to emit only 5 findings so that the alert feed is not spammed
        if (findingsCount >= 5) return [];

        const findings = await highValueEventAgent.handleTransaction(txEvent);

        findingsCount += findings.length;
        return findings;
    }
}

module.exports = {
    provideHandleTransaction,
    handleTransaction: provideHandleTransaction(
        highValueEventAgent,
    ),
};
