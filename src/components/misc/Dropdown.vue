<template>
    <div class="custom-select">
        <select ref="select" @input="oninput">
            <option
                v-for="item in items"
                :key="item.key"
                :disabled="item.disabled"
                :value="item.key"
            >
                {{ item.label }}
            </option>
        </select>
        <p class="arrow"><fa icon="caret-down"></fa></p>
    </div>
</template>
<script>
export default {
    props: {
        items: {
            type: Array,
            required: true,
        },
        initial: {
            type: String,
        },
    },
    methods: {
        oninput(ev) {
            let val = ev.target.value
            // console.log(ev.target.value);

            let data = this.item_map[val]
            this.$emit('change', data)
        },
    },
    computed: {
        selected() {
            return 0
        },
        item_map() {
            let res = {}
            for (var i = 0; i < this.items.length; i++) {
                let item = this.items[i]
                res[item.key] = item.data
            }
            return res
        },
    },
    mounted() {
        if (this.initial) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].key === this.initial) {
                    this.$refs.select.value = this.items[i].key
                }
            }
        }
    },
}
</script>
<style scoped>
.custom-select {
    position: relative;
    width: 90px;
    padding: 0px 6px;
    border-radius: 0;
    text-align: center;
}

.custom-select select {
    width: 100%;
    height: 100%;
    outline: none;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-right: 12px;
    z-index: 2;
}

.arrow {
    position: absolute;
    right: 6px;
    top: 0;
    margin: 0;
    height: 100%;
    /*transform: translateY(50%);*/
    pointer-events: none;
}

select:active .arrow {
    transform: rotateX(180deg);
}

select option {
}

/*.select-selected:after {*/
/*    position: absolute;*/
/*    content: "";*/
/*    top: 14px;*/
/*    right: 10px;*/
/*    width: 0;*/
/*    height: 0;*/
/*    border: 6px solid transparent;*/
/*    border-color: #fff transparent transparent transparent;*/
/*}*/

/*.select-selected.select-arrow-active:after {*/
/*    border-color: transparent transparent #fff transparent;*/
/*    top: 7px;*/
/*}*/

/*.custom-select:after{*/

/*}*/
</style>
