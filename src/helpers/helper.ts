
import store from '@/store/index';

function getAssetIcon(id:string){
    let url = "/question-solid.svg";
    let AVA = store.getters['Assets/AssetAVA'];

    if(id === AVA.id){
        url= "/ava_letter_icon.png";
    }
    return url;
}


export {getAssetIcon};
