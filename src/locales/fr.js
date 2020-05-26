let fr = {
    password: 'Mot de passe',
    password_confirm: 'Confirmer mot de passe',
    private_key: "Clef privée",
    address: 'Adresse',
    home: {
        but_access: "Accéder",
        but_create: "Créer",
        go_back: "Retour en arrière",

        access_opt1: "Clef privée",
        access_opt2: "Fichier de clés",
        access_sel_file: "Selectionner le fichier de clés",
        access: {
            title: 'Accéder au portefeuille',
            desc: 'Accéder à un portefeuille existant en utilisant un clef privée ou un fichier de clef.',
            key: {
                title: 'Clef privée',
            },
            file: {
                title: 'Fichier de clés'
            },
        },
        create: {
            title: 'Create New Wallet',
            desc: 'Create a new wallet to store your assets',
            generate: 'Generate Key Pair',
            warning: "Do not lose your private key! If you do you won't be able to access your wallet and funds again. There is no way to recover lost keys.",
            submit: 'Access Wallet'
        },

        submit: "Access Wallet",
    },
    top: {
        title1: "My Address",
        title2: "Balance",
        title3: 'Network',
        hover1: 'View Address QR Code',
        hover2: 'Print',
        hover3: 'Copy',
    },
    transfer: {
        title: 'Send Transaction',
        no_cash: 'You must have an asset in your wallet to issue a transaction.',
        faucet: 'Have you checked our faucet?',
        to: 'To Address',
        fees: 'Fees',
        fee_tx: 'Transaction Fee',
        advanced: 'Advanced',
        adv_change: 'Change Address',
        send: 'Send'
    },
    advanced: {
        title: 'Advanced',
        paper: {
            title: 'Scan Paper Wallet',
            desc: 'Scan the private key from a paper wallet to add to your managed key pairs.',
            pk: 'Private Key',
            submit: 'Add To Keychain',
        },
        export: {
            title: 'Export Wallet',
            desc: 'Download your keys in a password encrypted file.',
            submit: 'Download',
        },
        import: {
            title: 'Import Wallet',
            desc: 'Upload a key file to use within your wallet.',
            submit: 'Import',
        }
    },
    assets: {
        title: 'Assets',
        empty: 'You do not have any assets.',
    },
    tabs: {
        send: 'Send',
        keys: 'Manage Keys',
        advanced: 'Advanced',
    },
    keys: {
        title: 'Manage Keys',
        address: 'Address',
        balance: 'Balance',
        empty: 'This address does not have any assets in it.',
        del_check: 'Are you sure you want to delete this key and address from your wallet? You will not be able to use the funds associated with it anymore.',
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
    // notif: {
    //   tx: {
    //     success: {
    //       title: 'Transaction Sent',
    //       msg: 'You have succesfully sent your transaction.'
    //     }
    //   },
    //   key: {
    //
    //   }
    // }
};

export {fr};
