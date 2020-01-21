// console.log(avajs.AVAJS);
//
// // @ts-ignore
let AVAJS = new avajs.AVAJS('ava.network', 21015, 'https');
    // AVAJS.endpoints.assets.setEndpoint('/ext/subnet/avm');
console.log(avajs);
console.log(AVAJS);
console.log(AVAJS.Wallet)

// let WalletAPI = new WalletAPI
//
let wallet = AVAJS.Wallet();
let AVAAssets = AVAJS.AVAAssets();
    // AVAAssets.setEndpoint('/ext/subnet/avm');
console.log(AVAAssets);
console.log(AVAAssets.keyChain());

let binTools = avajs.TypesLibrary.BinTools;

export { AVAAssets, binTools };

// console.log(wallet);
//
// wallet.CreateAccount('wassupsteven', 'randompassword').then((res) => {
//     console.log(res);
// });
// //
// console.log(wallet);
// wallet.CreateAccount('testname', 'mypassword').then(res => {
//     console.log(res);
// });
//
// export default AVAJS
