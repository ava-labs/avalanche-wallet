<template>
    <div class="avax_input">
        <div class="col1">
            <button class="max_but" @click="maxOut">MAX</button>
            <BigNumInput
                ref="amt_in"
                class="amt_in"
                contenteditable="amt_in"
                :denomination="9"
                :max="max"
                @change="amount_in"
            ></BigNumInput>
        </div>
        <p>AVAX</p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Model } from 'vue-property-decorator'

//@ts-ignore
import { BigNumInput } from '@avalabs/vue_components'
import { BN } from 'avalanche'

@Component({
    components: {
        BigNumInput,
    },
})
export default class AvaxInput extends Vue {
    @Model('change', { type: Object }) readonly amount!: boolean

    @Prop() max?: BN | null

    maxOut(ev: MouseEvent) {
        ev.preventDefault()
        ev.stopPropagation()
        //@ts-ignore
        this.$refs.amt_in.maxout()
    }

    amount_in(val: BN) {
        this.$emit('change', val)
    }
}
// export default {
//     props: {
//         max: {
//             type: BN,
//             default: null
//         }
//     },
//     components: {
//         BigNumInput
//     },
//     methods: {
//         maxOut(){
//             this.$refs.amt_in.maxout();
//         },
//
//         amount_in(val: BN){
//
//         }
//     }
// }
</script>
<style scoped lang="scss">
.avax_input {
    display: grid;
    grid-template-columns: 1fr 60px;
    grid-gap: 10px;
    color: var(--primary-color);
    width: 100%;
}

.col1 {
    border-radius: 3px;
    background-color: var(--bg-light);
    //display: flex;
    display: grid;
    grid-template-columns: max-content 1fr;
    width: 100%;
    box-sizing: border-box;
    overflow: auto;
    padding: 8px 14px;
}

.amt_in {
    color: var(--primary-color);
    font-family: monospace;
    flex-grow: 1;
    flex-shrink: 1;
    display: block;
    box-sizing: content-box;
    //padding: 0 12px !important;
}

.amt_in,
p,
.max_but {
    background-color: var(--bg-light);
    //border-radius: 3px;
}

p {
    padding: 8px 6px;
    text-align: center;
}
.max_but {
    opacity: 0.4;
    &:hover {
        opacity: 1;
    }
}
</style>
