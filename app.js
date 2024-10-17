// Initialize Web3 and connect to Ganache
const web3 = new Web3('http://127.0.0.1:7545');

// Add the contract ABI and Address
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userFiles",
        "outputs": [
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "fileHash",
                "type": "string"
            }
        ],
        "name": "storeFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getFileCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getFile",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    }
];

const contractAddress = '0x48F2c399A4f736e06deeE1d507530C378A1CD339'; // Replace with the actual contract address from Ganache
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to hash the file using SHA-256
async function hashFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;  // Returns the file hash as a hex string
}

// Function to show the user's transaction history
async function showTransactionHistory(account) {
    const transactionHistory = document.getElementById('transactionHistory');
    transactionHistory.innerHTML = '';  // Clear the previous history

    try {
        const fileCount = await contract.methods.getFileCount(account).call({ from: account, gas: 9000000000 });
        console.log('File count:', fileCount);

        for (let i = 0; i < fileCount; i++) {
            const fileData = await contract.methods.getFile(account, i).call();
            const fileHash = fileData[0];
            const timestamp = new Date(fileData[1] * 1000).toLocaleString();
            transactionHistory.innerHTML += `
                <p>File Hash: ${fileHash} <br> Uploaded at: ${timestamp}</p>
                <hr>
            `;
        }

        if (fileCount === 0) {
            transactionHistory.innerHTML = `<p>No transactions found.</p>`;
        }
    } catch (err) {
        console.error('Error fetching transaction history:', err);
        transactionHistory.innerHTML = `<p>Error loading transaction history.</p>`;
    }
}

// Function to update transaction details
function updateTransactionDetails(transaction) {
    document.getElementById('transactionValue').textContent = transaction.value; // e.g., "0.00 ETH"
    document.getElementById('gasUsed').textContent = transaction.gasUsed; // e.g., "538126"
    document.getElementById('gasPrice').textContent = transaction.gasPrice; // e.g., "20 Gwei"
    document.getElementById('gasLimit').textContent = transaction.gasLimit; // e.g., "6721975"
    document.getElementById('minedInBlock').textContent = transaction.blockNumber; // e.g., "26"
    document.getElementById('blockHash').textContent = transaction.blockHash; // Display the block hash
}

// Upload file function
async function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
    const fileHash = await hashFile(file);
    console.log('File hash:', fileHash);

    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];  // Use the first Ganache account

    const gasLimit = 3000000; // Define the gas limit here

    try {
        // Store file hash on the blockchain
        const transactionReceipt = await contract.methods.storeFile(fileHash).send({ 
            from: account, 
            gas: gasLimit, 
            gasPrice: '20000000000' // 20 Gwei
        });
        alert('File hash stored on blockchain!');

        // Call the showTransactionHistory function to update the history
        showTransactionHistory(account);

        // Create a transaction object to store details
        const transaction = {
            value: "0.00 ETH", // Adjust if you want to calculate or fetch the actual transaction value
            gasUsed: transactionReceipt.gasUsed,
            gasPrice: (await web3.eth.getGasPrice()).toString() + ' Wei', // Fetch the current gas price
            gasLimit: gasLimit, // Use the defined gas limit
            blockNumber: transactionReceipt.blockNumber,
            blockHash: transactionReceipt.blockHash // Get the block hash from the receipt
        };

        updateTransactionDetails(transaction);  // Update the displayed transaction details
    } catch (err) {
        console.error('Error storing file:', err);
        alert('Error storing the file on the blockchain');
    }
}
