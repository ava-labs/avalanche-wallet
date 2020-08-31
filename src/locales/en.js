let en = {
    password: 'Password',
    password_confirm: 'Confirm Password',
    private_key: 'Private Key',
    address: 'Address',
    add_pk: 'Add Private Key',
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
        },
    },
    network: {
        status1: "Connecting ...",
        status2: "Disconnected",
        title: "Networks",
        title2: "Add Custom Network",
        title3: "Edit Network",
        custom: "Add Custom",
        cancel: "Cancel",
        add: "Add Network"
    },
    access: {
        title: 'How do you want to access your wallet?',
        create: 'Don\'t have a wallet?',
        but_mnemonic: 'Mnemonic Key Phrase',
        but_keystore: 'Keystore File',
        cancel: 'Cancel',
        json_error: 'Unable to parse JSON file.',
        keystore_error: 'This keystore version is not supported.',
        password_error: 'Invalid Password.',
        mnemonic: {
            title: 'Enter your MNEMONIC phrase\n',
            subtitle: 'Hit ‘SPACE’ after every successful word entry.',
            submit: 'Access Wallet',
            cancel: 'Cancel',
            error: 'Invalid key phrase. Your phrase must be 24 words separated by a single space.',
        }
    },
    wallet: {
        sidebar: {
            portfolio: 'Portfolio',
            manage: 'Manage',
            send: 'Send'
        },
        address_card: {
            desc: 'This is your address to receive funds. Your address will change after every deposit.',
            sub: 'Derived AVAX Wallet Address',
        },
        collectibles: {
            empty: "You do not own any collectibles."
        }
    },
    create: {
        generate: 'Generate a new key phrase to use with your wallet.',
        but_have: 'Already have a wallet?',
        submit: 'Generate Key Phrase',
        cancel: 'Cancel',
        mnemonic_title: 'This is your 24 word key phrase.',
        mnemonic_desc: 'You will use these words to access your wallet.',
        attention: 'Attention!',
        warning: 'STORE THIS KEY PHRASE IN A SECURE LOCATION. ANYONE WITH THIS KEY PHRASE CAN ACCESS YOUR WALLET. THERE IS NO WAY TO RECOVER LOST KEY PHRASES!',
        confirm: 'I wrote down my mnemonic phrase in a secure location.',
        regenerate: 'Regenerate',
        success_title: 'Congratulations!',
        success_desc: 'It`s time to open your Avalanche Wallet',
        success_submit: 'Access Wallet',
        verify: 'Verify',
        verifytitle: 'Verify Mnemonic',
        verify_desc: 'Fill In Mnemonic Phrase Below',
        error_number: 'Oops, looks like you forgot to fill number',
        error_word: 'The mnemonic phrase you entered for word not match the actual phrase.',
    },
    top: {
        title1: 'Derived AVAX Wallet Address',
        title2: 'Balance',
        title3: 'Subnet',
        title4: 'Network',
        nftcol: 'NFTs',
        nftempty: 'You have not collected any non fungible tokens.',
        locked: 'Locked',
        info2: 'I bought coins in the Token Sale. Where are my AVAX?',
        info2_desc: 'This wallet is connected to the Avalanche Everest test network. Your purchase will appear in the wallet after the Avalanche Mainnet launch.',
        hover1: 'View Address QR Code',
        hover2: 'Print',
        hover3: 'Copy',
        hover4: 'View Mainnet Address'
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
        send: 'Send Transaction',
        summary: "Transaction Summary",
        disconnected: 'Unable to send assets. Disconnected from the network.',
        success_title: 'Transaction Sent',
        success_msg: 'You have succesfully sent your transaction.',
        error_title: 'Error Sending Transaction',
        error_msg: 'Failed to send transaction.',
    },
    keys: {
        title: 'My Keys',
        button1: 'REMEMBER KEYS',
        button2: 'IMPORT KEYS',
        button3: 'EXPORT KEYS',
        subtitle: 'Active Key',
        remember_key_button: 'REMEMBER',
        remember_key_desc: 'Encode your wallet with a password and store securely on this browser.',
        remember_key_check: 'Remember Keys',
        remember_key_info: 'You can later access your wallet on this browser with a password.',
        export_key_button: 'EXPORT WALLET',
        export_key_title: 'Export Keys',
        export_key_desc: 'Enter a password to encode your private keys into a file. You can later use this file and your password to access your wallet.',
        export_key_info: `Selected {0} keys.`,
        export_placeholder1: 'Password',
        export_placeholder2: 'Confirm Password',
        empty: 'This key does not have a balance.',
        import_key_button: 'IMPORT KEY',
        import_key_title: 'Import Keys',
        import_key_desc: 'Add additional keys to use with your wallet.',
        import_key_option1: 'MNEMONIC PHRASE',
        import_key_option2: 'KEYSTORE FILE',
        import_key_success_title: 'Key Added',
        import_key_success_msg: 'Private key and assets added to the wallet.',
        tooltip: 'This key will be forgotten when you refresh the browser.',
        view_key: 'View Key Phrase',
        export_key: 'Export Key',
        hd_addresses: 'HD Addresses',
        remove_key: 'Remove Key',
        activate_key: 'Activate Key',
        remove_success_title: 'Key Removed',
        remove_success_msg: 'Private key and assets removed from the wallet.',  
        password_validation: 'Password must be at least 9 characters long.',
        password_validation2: 'Password do not match.',     
    },
    portfolio: {
        assets: 'Assets',
        assets1: 'FUNGIBLES',
        assets2: 'COLLECTIBLES',
        search: 'Search Assets',
        name: 'Name',
        send: 'Send',
        balance: 'Balance',
        error_network: 'Unable to display assets. Disconnected from the network.',
        nobalance: 'You do not have any assets',
        nobalance_nft: 'You do not own any NFTs.',
        noaddresses: 'You do not have any past addresses.',
    },
    logout: {
        button: 'Log Out',
        button_conf: 'LOGOUT',
        button_cancel: 'Cancel',
        confirmation: 'Are you sure you want to log out?',
        confirmation_messege: 'This wallet and its keys will be forgotten.',
    },


    keystore: {
        title: 'Keystore File',
        button: 'Select File'

    },

    transactions: {
        notx: 'No transactions found for this address on the explorer.',
        loading: 'Loading transaction history..',
        warn_loading: 'This list might be incomplete and out of order.',
        error_api: 'Explorer API Not Found',
        error_api_desc: 'You must provide an AVA Explorer API for this network to view transaction history.',


    },
    modal: {
        qr: {
            title: 'Address',
            copy: 'Copy Address'
        },
        print: {
            title: 'Print Preview',
            submit: 'Print'
        },
        keystore: {
            title: "Update Keystore File",
            desc: `We have upgraded the keystore files. Please download your new keystore file and access the wallet again.`,
            logout: 'Logout & Access Again'
        },
        mainnet: {
            title: 'Mainnet Address',
            desc: 'Your mainnet address is:'
        },
        mnemonic: {
            title: 'Key Phrase'
        },
        activateWallet: {
            title: "Activate Wallet",
            desc: "There is an active wallet. Enter your password to access it.",
            submit: 'Access Wallet',
            cancel: 'Access another wallet',
            cancel2: '(Previous wallet will be forgotten.)',
            err1: 'Invalid password.',
            err2: 'Unable to read wallet data.'
        }
    },
};
export { en };
