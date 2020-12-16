<template>
    <div class="dates">
        <div>
            <label>{{ $t('earn.validate.duration.start') }}</label>
            <datetime
                v-model="localStart"
                type="datetime"
                :min-datetime="startDateMin"
                :max-datetime="startDateMax"
            ></datetime>
        </div>
        <div>
            <label
                >{{ $t('earn.validate.duration.end') }}
                <span @click="maxoutEndDate">Max</span></label
            >
            <datetime
                v-model="localEnd"
                type="datetime"
                :min-datetime="endDateMin"
                :max-datetime="endDateMax"
            ></datetime>
        </div>
    </div>
</template>
<script lang="ts">
import { DAY_MS, MINUTE_MS } from '../../../constants'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

const MIN_STAKE_DURATION = DAY_MS * 14

@Component
export default class DateForm extends Vue {
    timeNow = 0

    localStart = this.startDateMin
    localEnd = this.endDateMin

    @Prop() maxEndDate?: string

    @Watch('localStart')
    startChange(val: string) {
        this.setStartDate(val)

        if (this.stakeDuration < MIN_STAKE_DURATION) {
            this.localEnd = this.endDateMin
        }
    }

    @Watch('localEnd')
    endChange(val: string) {
        this.setEndDate(val)

        let endTime = new Date(val).getTime()
        let minDateTime = new Date(this.endDateMin).getTime()

        if (endTime < minDateTime) {
            this.localEnd = this.endDateMin
        }
    }

    created() {
        this.updateTimeNow()
    }

    mounted() {
        this.localStart = this.startDateMin

        // default end date is 3 weeks
        this.localEnd = this.defaultEndDate

        this.setStartDate(this.localStart)
        this.setEndDate(this.localEnd)
    }

    updateTimeNow() {
        this.timeNow = Date.now()

        let remaining = MINUTE_MS - (this.timeNow % MINUTE_MS)
        // If current start date is less than now
        let startCurrent = new Date(this.localStart)
        if (startCurrent.getTime() <= this.timeNow + remaining) {
            this.localStart = this.startDateMin
        }
        setTimeout(() => {
            this.updateTimeNow()
        }, 10000)
    }

    setStartDate(val: string) {
        this.$emit('change_start', val)
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

    // 1 minute from now
    get startDateMin() {
        let now = this.timeNow || Date.now()
        let res = now + MINUTE_MS + (now % MINUTE_MS)
        return new Date(res).toISOString()
    }

    // 2 weeks
    get startDateMax() {
        let startDate = new Date()
        // add 2 weeks
        let endTime = startDate.getTime() + 60000 * 60 * 24 * 14
        let endDate = new Date(endTime)
        return endDate.toISOString()
    }

    // Start date + 2 weeks
    get endDateMin() {
        let start = this.localStart
        let startDate = new Date(start)

        let end = startDate.getTime() + MIN_STAKE_DURATION
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
<style scoped lang="scss">
.dates {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;
    width: 100%;

    > div {
        width: 100%;
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
</style>
