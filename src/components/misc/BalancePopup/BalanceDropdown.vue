<template>
    <div class="dropdown">
        <button @click="showPopup">{{asset.symbol}}</button>
        <BalancePopup :assets="assetArray" ref="popup" class="popup" @select="onselect" :disabled-ids="disabledIds"></BalancePopup>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop, Ref, Model } from 'vue-property-decorator';

    import BalancePopup from "@/components/misc/BalancePopup/BalancePopup.vue";
    import AvaAsset from "@/js/AvaAsset";


    @Component({
        components: {
            BalancePopup
        }
    })
    export default class BalanceDropdown extends Vue{
        @Prop({default: () => []}) disabled_assets!: AvaAsset[];

        // @Prop() asset!: AvaAsset;

        @Model('change', { type: AvaAsset }) readonly asset!: AvaAsset


        // selected:AvaAsset = this.assetArray[0];

        get assetArray():AvaAsset[]{
            return this.$store.getters.walletAssetsArray;
        }

        @Ref('popup') readonly balancePopup!: BalancePopup;



        get disabledIds(): string[]{
            let disabledIds = this.disabled_assets.map(a => a.id);
            return disabledIds;
        }
        // isAssetDisabled(asset:AvaAsset):boolean{
        //     let id = asset.id;
        //     let disabledIds = this.disabled_assets.map(a => a.id);
        //     if(disabledIds.includes(id)){
        //         return true;
        //     }
        //     return false;
        // }


        showPopup(){
            this.balancePopup.isActive = true;
        }

        onselect(asset: AvaAsset){
            // this.selected = asset;
            this.balancePopup.isActive = false;

            this.$emit('change', asset);
        }
    }
</script>
<style scoped lang="scss">
    button{
        padding: 4px 12px;
        width: 100%;
        height: 100%;
        text-align: left;
    }

    .dropdown{
        position: relative;
    }

    .popup{
        position: absolute;
    }
</style>
