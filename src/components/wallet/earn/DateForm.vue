<template>
    <div class="dates_form">
        <div class="hover_border">
            <button class="max_but" @click="maxoutEndDate">Max</button>
            <datetime
                v-model="localEnd"
                type="datetime"
                class="date"
                :min-datetime="endDateMin"
                :max-datetime="endDateMax"
            ></datetime>
        </div>
    </div>
</template>
<script lang="ts">
import { DAY_MS, MINUTE_MS } from '../../../constants'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Datetime } from 'vue-datetime'

const MIN_STAKE_DURATION = DAY_MS * 183

@Component({
    components: {
        Datetime,
    },
})
export default class DateForm extends Vue {
    // timeNow = 0
    @Prop() tx?: boolean
    localStart = this.startDateMin
    localEnd = this.endDateMin

    @Prop() maxEndDate?: string

    // @Watch('localStart')
    // startChange(val: string) {
    //     this.setStartDate(val)
    //
    //     if (this.stakeDuration < MIN_STAKE_DURATION) {
    //         this.localEnd = this.endDateMin
    //     }
    // }

    @Watch('localEnd')
    endChange(val: string) {
        this.setEndDate(val)

        let endTime = new Date(val).getTime()
        let minDateTime = new Date(this.endDateMin).getTime()

        if (endTime < minDateTime) {
            this.localEnd = this.endDateMin
        }
    }

    mounted() {
        this.localStart = this.startDateMin

        // default end date is 3 weeks
        this.localEnd = this.defaultEndDate

        // this.setStartDate(this.localStart)
        this.setEndDate(this.localEnd)
    }

    setEndDate(val: string) {
        this.$emit('change_end', val)
    }

    maxoutEndDate() {
        this.localEnd = this.endDateMax
    }

    get stakeDuration(): number {
        let start = new Date(this.localStart)
        let end = new Date(this.localEnd)
        let diff = end.getTime() - start.getTime()
        return diff
    }

    // 15 minutes from now
    // In reality it will be 5 minutes after the form is submitted
    get startDateMin() {
        let now = Date.now()
        let res = now + MINUTE_MS * 15
        return new Date(res).toISOString()
    }

    // now + 15 minutes + 2 weeks (Min Staking Duration)
    get endDateMin() {
        let start = this.localStart
        let startDate = new Date(start)

        let end = this.tx ? startDate.getTime() : startDate.getTime() + MIN_STAKE_DURATION
        let endDate = new Date(end)
        return endDate.toISOString()
    }

    // Start date + 1 year, or the prop
    get endDateMax() {
        if (this.maxEndDate) return this.maxEndDate

        let start = this.localStart
        let startDate = new Date(start)

        let end = startDate.getTime() + DAY_MS * 365
        let endDate = new Date(end)
        return endDate.toISOString()
    }

    get defaultEndDate() {
        let start = this.localStart
        let startDate = new Date(start)

        let end = startDate.getTime() + DAY_MS * 21
        let endDate = new Date(end)
        return endDate.toISOString()
    }
}
</script>
<style lang="scss">
.hover_border {
    padding-right: 6px;
}

.dates_form {
    .date input {
        border: none !important;
        text-align: right;
        width: 100%;
    }
    .vdatetime-popup {
        border-radius: var(--border-radius-sm);
        overflow: hidden;
        background-color: var(--bg-light);
        color: var(--text-color);
        font-family: 'Inter', sans-serif;
        .vdatetime-popup__header {
            background-color: #0085ff;
        }
        .vdatetime-popup__header div {
            font-family: 'ClashDisplay', sans-serif;
        }
        .vdatetime-calendar__navigation--next svg path,
        .vdatetime-calendar__navigation--previous svg path {
            stroke: var(--text-color);
        }
        .vdatetime-calendar__navigation--next svg path:hover,
        .vdatetime-calendar__navigation--previous svg path:hover {
            opacity: 0.8;
        }
        .vdatetime-calendar__month__day:hover > span > span {
            background-color: #0085ff;
            color: #fff;
            opacity: 0.3;
        }
        .vdatetime-calendar__month__day--selected > span > span {
            background-color: #0085ff;
            color: #fff;
        }
        .vdatetime-popup__actions__button {
            color: #0085ff;
        }
    }
}
</style>
<style scoped lang="scss">
.dates_form {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 15px;
    width: 100%;

    > div {
        width: 100%;
        display: grid;
        grid-template-columns: max-content 1fr;
        background-color: var(--bg-light);
    }

    label > span {
        float: right;
        opacity: 0.4;
        cursor: pointer;
        &:hover {
            opacity: 1;
        }
    }
}

.max_but {
    padding-left: 12px;
    color: var(--primary-color-light);
    &:hover {
        color: var(--primary-color);
    }
}
</style>
