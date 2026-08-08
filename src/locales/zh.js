let zh = {
    password: '密码',
    password_confirm: '确认密码',
    private_key: "私钥",
    address: '地址',
    home: {
        but_access: "打开",
        but_create: "新建",
        go_back: "返回",

        access_opt1: "私钥",
        access_opt2: "keystore文件",
        access_sel_file: "选择密钥文件",
        access: {
            title: '打开钱包',
            desc: '使用私钥或密钥文件打开已有钱包。',
            key: {
                title: '私钥',
            },
            file: {
                title: '密钥文件'
            },
        },
        create: {
            title: '新建钱包',
            desc: '创建一个新钱包来存储资产',
            generate: '生成密钥对',
            warning: "不要丢失你的私钥！如果丢失你将无法再次使用你的钱包和资产。没有方法可以恢复丢失的密钥。",
            submit: '打开钱包'
        },

        submit: "打开钱包",
    },
    top: {
        title1: "我的地址",
        title2: "余额",
        title3: '子网',
        title4: '主网',
        hover1: '查看地址二维码',
        hover2: '打印',
        hover3: '复制',
    },
    transfer: {
        title: '转账',
        no_cash: '你的钱包里必须要有资产以发起转账。',
        faucet: '你检查过我们的水龙头吗？',
        to: '收款地址',
        fees: '手续费',
        fee_tx: '转账手续费',
        advanced: '高级',
        adv_change: '改变地址',
        send: '发起转账'
    },
    advanced: {
        title: '高级',
        paper: {
            title: '添加密钥',
            desc: '往钱包添加额外可使用的私钥。',
            pk: '私钥',
            submit: '添加',
        },
        export: {
            title: '导出钱包',
            desc: '输入密码加密私钥并生成一个文件。你之后可以使用该文件和密码来打开钱包.',
            submit: '导出',
        },
        import: {
            title: '导入钱包',
            desc: '往钱包上传一个可使用的密钥文件。',
            submit: '导入',
        }
    },
    assets: {
        title: '资产',
        empty: '你没有任何资产',
    },
    tabs: {
        send: '转账',
        keys: '管理密钥',
        advanced: '高级',
    },
    keys: {
        title: '管理密钥',
        address: '地址',
        balance: '余额',
        empty: '这个密钥和钱包没有任何资产。',
        del_check: '你确定要删除该密钥和钱包？',
    },
    modal: {
        qr: {
            title: "地址"
        },
        print: {
            title: '打印预览',
            submit: '打印'
        }
    },
    // notif: {
    //   tx: {
    //     success: {
    //       title: '转账完成',
    //       msg: '你成功完成了一笔转账。'
    //     }
    //   },
    //   key: {
    //
    //   }
    // }
};

export { zh };
