<template>
    <div class="dropdown" :active="isPopup">
        <button @click="showPopup">
            {{asset.symbol}}
            <fa icon="caret-down" style="float: right"></fa>
        </button>
        <BalancePopup :assets="assetArray" ref="popup" class="popup" @select="onselect" :disabled-ids="disabledIds" @close="onclose"></BalancePopup>
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
        isPopup:boolean = false;

        @Prop({default: () => []}) disabled_assets!: AvaAsset[];
        @Model('change', { type: AvaAsset }) readonly asset!: AvaAsset

        get assetArray():AvaAsset[]{
            return this.$store.getters.walletAssetsArray;
        }

        @Ref('popup') readonly balancePopup!: BalancePopup;



        get disabledIds(): string[]{
            let disabledIds = this.disabled_assets.map(a => a.id);
            return disabledIds;
        }

        // get isPopup(){
        //     if(this.balancePopup){
        //         return this.balancePopup.isActive;
        //     }
        //     return false;
        // }


        showPopup(){
            this.balancePopup.isActive = true;
            this.isPopup = true;
        }

        onclose(){
            this.isPopup = false;
        }

        onselect(asset: AvaAsset){
            // this.selected = asset;
            this.balancePopup.isActive = false;
            this.isPopup = false;

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

        svg{
            transition-duration: 0.2s;
        }
    }

    .dropdown{
        position: relative;
    }

    .dropdown[active]{
        button{
            svg{
                transform: rotateZ(180deg);
            }
        }
    }
    .popup{
        position: absolute;
    }
</style>
