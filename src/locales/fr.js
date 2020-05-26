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
            desc: 'Accéder à un portefeuille existant en utilisant une clef privée ou un fichier de clef.',
            key: {
                title: 'Clef privée',
            },
            file: {
                title: 'Fichier de clés'
            },
        },
        create: {
            title: 'Créer un nouveau portefeuille',
            desc: 'Création d\'un nouveau portfeuille pour stocker vos assets',
            generate: 'Génération d\'une paire de clés',
            warning: "Ne perdez pas votre clef privée ! Vous perdriez tout accès à votre portefeuille et fonds ! Il n'y a pas moyen de récupérer votre clef privée en cas de perte.",
            submit: 'Accéder au portefeuille'
        },

        submit: "Accéder au portefeuille",
    },
    top: {
        title1: "Mon adresse",
        title2: "Balance",
        title3: 'Réseau',
        hover1: 'Voir le QR Code de l\'adresse',
        hover2: 'Imprimer',
        hover3: 'Copier',
    },
    transfer: {
        title: 'Envoyer la transaction',
        no_cash: 'Vous devez avoir un asset dans votre portefeuille avant de pouvoir émettre une transaction.',
        faucet: 'Avez-vous vu notre faucet ?',
        to_faucet: 'Aller sur le faucet.',
        to: 'Vers l\'adresse',
        fees: 'Frais',
        fee_tx: 'Frais de transaction',
        advanced: 'Avancé',
        adv_change: 'Changer l\'adresse',
        send: 'Envoyer'
    },
    advanced: {
        title: 'Avancé',
        paper: {
            title: 'Scanner le portefeuille papier',
            desc: 'Scanner la clef privée depuis un portefeuille papier pour l\'ajouter a vos paires de clés gérée.',
            pk: 'Clés privée',
            submit: 'Ajouter au porte-clés',
        },
        export: {
            title: 'Exporter le portefeuille',
            desc: 'Télécharger vos clés dans un fichier protégé par mot de passe.',
            submit: 'Télécharger',
        },
        import: {
            title: 'Importer un portefeuille',
            desc: 'Téléverser un fichier de clef afin de l\'utiliser dans votre portefeuille.',
            submit: 'Importer',
        }
    },
    assets: {
        title: 'Assets',
        empty: 'Vous n\'avez pas d\'assets.',
    },
    tabs: {
        send: 'Envoyer',
        keys: 'Gérer les clefs',
        advanced: 'Avancé',
    },
    keys: {
        title: 'Gérer les clefs',
        address: 'Adresse',
        balance: 'Balance',
        empty: 'Cette adresse ne posséde pas d\'assets.',
        del_check: 'Êtes-vous sur de vouloir supprimer cette clef et adresse de votre portefeuille? Il ne sera plus possible d\'utiliser les fons qui y sont liés',
    },
    modal: {
        qr: {
            title: "Adresse"
        },
        print: {
            title: 'Imprimer l\'aperçu',
            submit: 'Imprimer'
        }
    },
    // notif: {
    //   tx: {
    //     success: {
    //       title: 'Transaction envoyée',
    //       msg: 'La transaction a été envoyée avec succés.'
    //     }
    //   },
    //   key: {
    //
    //   }
    // }
};

export {fr};
