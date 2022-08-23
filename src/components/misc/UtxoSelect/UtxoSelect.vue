<template>
    <div class="utxo_select">
        <div class="buts">
            <button @click="select('all')" :selected="selected === 'all'">All</button>
            <button @click="select('unlocked')" :selected="selected === 'unlocked'">
                Unlocked
            </button>
            <button @click="select('locked')" :selected="selected === 'locked'">Locked</button>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UTXOSet } from '@c4tplatform/camino/dist/apis/platformvm'
import { UnixNow } from '@c4tplatform/camino/dist/utils'
type Selection = 'all' | 'unlocked' | 'locked'
@Component
export default class UTXOSelect extends Vue {
    @Prop() utxos!: UTXOSet
    selected: Selection = 'all'
    select(type: Selection) {
        this.selected = type
        this.$emit('change', this.selectedSet)
    }
    get selectedSet() {
        switch (this.selected) {
            case 'all':
                return this.utxos
            case 'unlocked':
                return this.unlocked
            case 'locked':
                return this.locked
        }
        return this.utxos
    }
    get unlocked(): UTXOSet {
        let utxos = this.utxos.getAllUTXOs()
        let res = new UTXOSet()
        let now = UnixNow()
        for (var i = 0; i < utxos.length; i++) {
            let utxo = utxos[i]
            let out = utxo.getOutput()
            let type = out.getOutputID()
            if (type !== 22) {
                let locktime = out.getLocktime()
                if (locktime.lt(now)) {
                    res.add(utxo)
                }
            }
        }
        return res
    }
    get locked(): UTXOSet {
        return this.utxos.difference(this.unlocked)
    }
}
</script>
<style scoped lang="scss">
.utxo_select {
    display: flex;
    margin: 4px 0;
    button {
        font-size: 13px;
        padding: 4px 8px;
        background-color: var(--bg-light);
        &[selected] {
            background-color: var(--primary-color);
            color: var(--bg);
        }
    }
}
.buts {
    border-radius: var(--border-radius-sm);
    overflow: hidden;
}
</style>
