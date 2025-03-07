module.exports = main;

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main(username, query_function, ...args) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log('An identity for the user does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        console.log("IDENTITY:" + identity)

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // MY_COMMENT
        // getting one student by specified id
        // const result = await contract.evaluateTransaction('getStudent', 'student_02');
        // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // MY_COMMENT
        // getting all students
        // const result = await contract.evaluateTransaction('getAllStudents');
        // console.log(`Transaction successfully evaluated, result is: \n ${result.toString()} `)

        // MY_COMMENT
        // getting students by name
        const result = await contract.evaluateTransaction(query_function, ...args);
        // console.log(`Transaction complete, result: ${result.toString()}`);
        return result.toString();

        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

// main();

