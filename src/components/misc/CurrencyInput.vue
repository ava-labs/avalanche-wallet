<template>
    <div class="curr_in" :disabled="disabled">
        <button v-if="canMax" @click="maxOut">MAX</button>
        <input
            type="number"
            :min="minVal"
            :step="tick_size"
            placeholder="0.00"
            :value="value"
            @input="handleInput"
            ref="in"
        />
        <p>{{ currency }}</p>
    </div>
</template>
<script>
export default {
    props: {
        currency: {
            type: String,
            required: true,
        },
        value: {
            type: Number,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        precision: {
            type: Number,
            default: 2,
        },
        tick_size: {
            type: Number,
            default: null,
        },
        maxVal: {
            type: Number,
            default: null,
        },
    },
    model: {
        prop: 'value',
        event: 'change',
    },
    methods: {
        handleInput() {
            let val = parseFloat(this.$refs.in.value)

            if (this.canMax) {
                let max = this.maxVal
                if (val > max && max != 0) {
                    val = max
                }
            }

            this.$emit('change', val)
        },
        maxOut() {
            this.$emit('change', this.maxVal)
        },
    },
    computed: {
        // currency(){
        //     if(!this.balanceItem) return '';
        //     return this.balanceItem.id;
        // },
        // max(){
        //     return this.balanceItem.data.availableBalance;
        // },
        canMax() {
            return this.maxVal != null
        },
        minVal() {
            if (this.tick_size) return this.tick_size
            return 0
        },
    },
}
</script>
<style scoped>
.curr_in[disabled] {
    opacity: 0.3;
    user-select: none;
    pointer-events: none;
}
.curr_in {
    margin: 2px 0px;
    background-color: #413e44;
    display: flex;
    font-size: 12px;
    color: #d2d2d2;
    align-items: center;
    min-height: 28px;
}

.curr_in button {
    padding: 0px 15px;
    outline: none;
    text-decoration: underline;
}

.curr_in_tog {
    border-left: 1px solid #3a3144;
    box-shadow: none;
    background-color: transparent !important;
}
input {
    text-align: right;
    outline: none;
    flex-grow: 1;
    /*width: calc(100% - 20px);*/
}
p {
    flex-basis: 40px;
    margin: 0 !important;
    font-weight: bold;
    text-align: center;
}

.v-btn {
    border-radius: 0;
    color: #d2d2d2;
}
</style>
