<template>
    <div class="mnemonic_display">
        <div v-for="i in wordNum" :key="i" class="word">
            <p class="index">{{i}}</p>
            <p class="phrase_word">{{phraseArray[i-1]}}</p>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    @Component
    export default class MnemonicDisplay extends Vue{
        wordNum:number = 24;

        get phraseArray():string[]{
            let words = this.phrase.split(' ');
            let res:string[] = [];

            for(let i=0;i<Math.max(words.length, this.wordNum);i++){
                let val = words[i] ? words[i] : '';
                res.push(val);
            }
            return res;
        }

        @Prop() phrase!:string;
    }


</script>
<style scoped lang="scss">
    .mnemonic_display{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 8px;
        row-gap: 16px;
        /*row-gap: 12px;*/
        font-size: 12px;
    }


    .word{
        /*background-color: #e2e2e2;*/
        border-bottom: 1px solid #ddd;
        /*border-radius: 4px;*/
        display: flex;

        overflow: hidden;
        > *{
            padding: 4px 6px;
        }
    }

    .index{
        /*background-color: #d2d2d2;*/
        width: 22px;
        /*padding: 6px;*/
        /*padding: 0px 4px;*/
        box-sizing: content-box;
        text-align: center;
        user-select: none;
        color: #aaa;
    }

    .phrase_word{
        text-align: center;
        flex-grow: 1;
    }

    p{

        text-align: left;
        /*padding: 4px 0px;*/
    }

    span{
        text-align: center;

    }
</style>
