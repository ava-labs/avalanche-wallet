<template>
    <div class="filter_settings">
        <div class="modal_body">
            <div class="inputs">
                <div class="uptime">
                    <label>Available Space</label>
                    <input type="number" min="0" step="1" v-model="availableSpace"><p>AVAX</p>
                </div>
                <div class="duration">
                    <label>Minimum Time Remaining</label>
                    <input type="range" min="14" max="365" step="1" v-model="minDuration">
                    <p style="display: inline-block;">{{durationText}}</p>
                </div>
                <div class="fee">
                    <label>Maximum Fee</label>
                    <input type="number" min="0" max="100" step="0.001" v-model="maxFee">
                </div>
                <div class="uptime">
                    <label>Minimum Uptime</label>
                    <input type="number" min="0" max="100" step="1" v-model="minUptime">
                </div>
            </div>

            <div class="preview">
                <p>6 Valdiators found that match the criteria.</p>
            </div>

            <div class="checkout">
                <v-btn class="button_secondary" depressed>Apply Filter</v-btn>
                <button @click="close">Cancel</button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import "reflect-metadata";
    import {Vue, Component, Prop, Watch} from "vue-property-decorator";
    import moment from "moment";

    const MINUTE_MS = 60000;
    const HOUR_MS = MINUTE_MS * 60;
    const DAY_MS = HOUR_MS * 24;

    @Component
    export default class FilterSettings extends Vue{
        minDuration = 14;
        maxFee = 10;
        minUptime = 70;
        availableSpace = 25000;
        close(){
            this.$emit('close');
        }

        get durationText(){
            let duration = moment.duration(this.minDuration*DAY_MS, 'milliseconds');

            return `${duration.months()} months ${duration.days()} days`
        }
    }
</script>
<style scoped lang="scss">
    .filter_settings{
        /*background-color: var(--bg);*/
        background-color: rgba(0,0,0,0.2);
    }

    .modal_body{
        width: 100%;
        max-width: 360px;

    }

    .inputs{
        background-color: var(--bg-light);
        > div{
            padding: 12px 30px;
            margin: 4px 0;
        }
    }

    label {
        display: block;
        text-align: left;
        color: var(--primary-color-light);
        font-size: 12px;
        margin-bottom: 20px;
    }

    .duration{
        p{
            color: var(--primary-color-light);
            margin-left: 12px !important;
        }
    }

    .fee, .uptime{
        input{
            text-align: right;
        }
    }

    .checkout{
        text-align: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }
</style>
