<template>
    <div v-if="!isEmpty">
        <div class="added_list">
            <div v-for="utxo in addedNfts" class="nft_icon" :key="utxo.id">
                <button @click="remove(utxo)" class="removeBut"><fa icon="times"></fa></button>
                <NftCard  :utxo="utxo" :mini="true" style="height: 100%; width: 100%; overflow: hidden;"></NftCard>
            </div>
            <button @click="showPopup" class="nft_icon card add_but">
                +<br>Add NFT
            </button>
        </div>
        <BalancePopup ref="popup" :is-nft="true" @select="addNft" :disabled-ids="usedNftIds" class="bal_popup"></BalancePopup>
    </div>
</template>
<script lang="ts">
    import {IWalletNftDict} from "../../../store/types";
    import {NftFamilyDict} from "../../../store/modules/assets/types";
    import BalancePopup from "@/components/misc/BalancePopup/BalancePopup.vue";

    import 'reflect-metadata';
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
    import { UTXO} from "avalanche/dist/apis/avm";
    import NftCard from "@/components/wallet/portfolio/NftCard.vue";

    @Component({
        components: {
            NftCard,
            BalancePopup
        }
    })
    export default class NftList extends Vue{
        addedNfts: UTXO[] = [];

        $refs!: {
            popup: BalancePopup
        }


        @Watch('addedNfts')
        onlistchange(val: UTXO[]){
            this.$emit('change', val);
        }

        get isEmpty(): boolean{
            return this.nftUTXOs.length === 0;
        }

        get nftUTXOs(): UTXO[]{
            return this.$store.getters.walletNftUTXOs;
        }

        get nftDict(): IWalletNftDict{
            return this.$store.getters.walletNftDict;
        }

        get nftFamsDict(): NftFamilyDict{
            return this.$store.state.Assets.nftFamsDict;
        }

        get usedNftIds(){
            return this.addedNfts.map((utxo: UTXO) => {
                return utxo.getUTXOID()
            })
        }

        clear(){
            this.addedNfts = [];
        }

        addNft(utxo: UTXO){
            this.addedNfts.push(utxo);
        }

        remove(utxo: UTXO){
            let utxos = this.addedNfts;
            for(var i=0; i<utxos.length;i ++){
                if(utxos[i].getUTXOID() === utxo.getUTXOID()){
                    this.addedNfts.splice(i,1);
                }
            }
        }

        showPopup(){
            this.$refs.popup.isActive = true;
        }


        mounted(){
            if(this.$route.query.nft){
                let utxoId = this.$route.query.nft as string;
                let target = this.nftUTXOs.find(el => {
                    return el.getUTXOID() === utxoId
                })

                if(target){
                    this.addNft(target);
                }
            }
        }
    }
</script>
<style scoped lang="scss">
    $nft_w: 90px;

    .added_list{
        display: flex;
        flex-wrap: wrap;
    }
    .nft_icon{
        flex-shrink: 0;
        flex-grow: 0;
        position: relative;
        width: $nft_w;
        height: $nft_w;
        background-color: var(--bg-light);
        border-radius: 3px;
        margin: 4px;
    }

    .add_but{
        opacity: 0.4;
        transition-duration: 0.2s;
        &:hover{
            opacity: 1;
        }
    }

    $remove_w: 24px;
    .removeBut{
        position: absolute;
        top: -$remove_w/4;
        right: -$remove_w/4;
        width: $remove_w;
        height: $remove_w;
        background-color: var(--bg-light);
        color: var(--primary-color-light);
        border: 3px solid var(--bg);
        font-size: 12px;
        border-radius: $remove_w;
        /*opacity: 0.4;*/

        &:hover{
            color: var(--primary-color);
            /*opacity: 1;*/
        }
    }


    .bal_popup{
        max-width: 320px;
    }
</style>
