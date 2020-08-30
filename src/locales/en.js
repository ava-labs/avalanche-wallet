let en = {
    password: 'Password',
    password_confirm: 'Confirm Password',
    private_key: "Private Key",
    address: 'Address',
    home: {
        access: {
            title: 'Welcome Back!',
            desc: 'You can \'Access\' your existing AVAX wallet here.',
            submit: 'Access',
        },
        create: {
            title: 'Are you new to Avalanche?',
            desc: '\'Create\' a new wallet to send, receive and SWAP all your assets.',
            submit: 'Create New Wallet',
            generate: `Generate a new key phrase to use with your wallet.`,
            but_have: `Already have a wallet?`,
            cancel: `Cancel`,
            mnemonic_title: `This is your 24 word key phrase.`,
            mnemonic_desc: `You will use these words to access your wallet.`,
            attention: `Attention!`,
            warning: `STORE THIS KEY PHRASE IN A SECURE LOCATION. ANYONE WITH THIS KEY PHRASE CAN ACCESS YOUR WALLET. THERE IS NO WAY TO RECOVER LOST KEY PHRASES!`,
            confirm: `I wrote down my mnemonic phrase in a secure location.`,
            regenerate: `Regenerate`,
            success_title: `Congratulations!`,
            success_desc: `It's time to open your Avalanche Wallet`,
            success_submit: `Access Wallet`,
            success_cancel: `Cancel`,
            verify: `Verify`,
            verifytitle: `Verify Mnemonic`,
            verify_desc: `Fill In Mnemonic Phrase Below`,
            error_number: `Oops, looks like you forgot to fill number`,
            error_word: `The mnemonic phrase you entered for word not match the actual phrase.`,


        },
    },
    access: {
        title: 'How do you want to access your wallet?',
        create: 'Don\'t have a wallet?',
        but_mnemonic: 'Mnemonic Key Phrase',
        but_keystore: 'Keystore File',
        cancel: 'Cancel',
        mnemonic: {
            title: "Enter your MNEMONIC phrase\n",
            subtitle: "Hit ‘SPACE’ after every successful word entry.",
            submit: "Access Wallet",
            cancel: "Cancel"
        }
    },
    top: {
        title1: "Derived AVAX Wallet Address",
        title2: "Balance",
        title3: 'Subnet',
        title4: 'Network',
        nftcol: `NFTs`,
        nftempty: `You have not collected any non fungible tokens.`,
        locked: `Locked`,
        info1: `This is your address to receive funds. Your address will change after every deposit.`,
        info2: `I bought coins in the Token Sale. Where are my AVAX?`,
        info2_desc: `This wallet is connected to the Avalanche Everest test network. Your purchase will appear in the wallet after the Avalanche Mainnet launch.`,
        hover1: 'View Address QR Code',
        hover2: 'Print',
        hover3: 'Copy',
        hover4: `View Mainnet Address`
    },
    transfer: {
        title: 'Send',
        no_cash: 'You must have an asset in your wallet to issue a transaction.',
        faucet: 'Have you checked our faucet?',
        to: 'To Address',
        fees: 'Fees',
        fee_tx: 'Transaction Fee',
        advanced: 'Advanced',
        adv_change: 'Change Address',
        send: 'Send Transaction'
    },
    portfolio: {
        assets: `Assets`,
        assets1: `FUNGIBLES`,
        assets2: `COLLECTIBLES`,
        search: `Search Assets`,
        name: `Name`,
        send: `Send`,
        balance: `Balance`,
        error_network: `Unable to display assets. Disconnected from the network.`,
        nobalance: `You do not have any assets`,
        nobalance_nft: `You do not own any NFTs.`
    },
    logout: {
        button: `Log Out`


    },

    transactions: {
        notx: `No transactions found for this address on the explorer.`,
        loading: `Loading transaction history..`,
        warn_loading: `This list might be incomplete and out of order.`,
        error_api: `Explorer API Not Found`,
        error_api_desc: `You must provide an AVA Explorer API for this network to view transaction history.`,


    },
    modal: {
        qr: {
            title: "Address"
        },
        print: {
            title: 'Print Preview',
            submit: 'Print'
        }
    },
};
export { en };
