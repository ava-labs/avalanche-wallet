<template>
    <div class="validator_card">
        <Spinner v-if="loading" style="color: var(--primary-color)"></Spinner>

        <div v-if="!loading" class="validator_child_card">
            <div class="validator_info">
                <div class="alt_validator_info">
                    <div>
                        <Tooltip style="display: inline-block" text="Staking Start Date">
                            <v-icon class="icon-mdi-camino">mdi-calendar-blank</v-icon>
                            <label>{{ startTime }}</label>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip style="display: inline-block" text="Staking End Date">
                            <v-icon class="icon-mdi-camino">mdi-calendar-remove-outline</v-icon>
                            <label>{{ endTime }}</label>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip style="display: inline-block" text="Up Time">
                            <v-icon class="icon-mdi-camino">mdi-arrow-up-bold</v-icon>
                            <label>{{ upTime }} %</label>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip style="display: inline-block" text="Remaining Validation Period">
                            <v-icon class="icon-mdi-camino">mdi-clock-time-five-outline</v-icon>
                            <label>{{ reaminingValidation }}</label>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <br />
            <div>
                <h4 class="input_label">{{ $t('earn.validate.nodeId') }}</h4>
                <span class="disabled_input" role="textbox">
                    {{ nodeId }}
                </span>
            </div>
            <div>
                <h4 class="input_label">Deposit Amount</h4>
                <AvaxInput
                    v-model="depositAmount"
                    :max="maxAmt"
                    ref="avaxinput"
                    :readonly="true"
                    class="amt_in"
                ></AvaxInput>
            </div>
            <div>
                <h4 class="input_label">Tx ID</h4>
                <span class="disabled_input" role="textbox">
                    {{ txID }}
                </span>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Spinner from '@/components/misc/Spinner.vue'
import moment from 'moment'
import { ava } from '@/AVA'
import { BN } from '@c4tplatform/caminojs'
import AvaxInput from '@/components/misc/AvaxInput.vue'
import Tooltip from '@/components/misc/Tooltip.vue'

@Component({
    name: 'validator_info',
    components: {
        Spinner,
        AvaxInput,
        Tooltip,
    },
})
export default class ValidatorInfo extends Vue {
    @Prop() nodeId!: string
    @Prop() nodeInfo!: any

    startTime: any
    endTime: any
    upTime: any
    reaminingValidation: any
    depositAmount: any
    txID: any

    loading: boolean = true

    mounted() {
        this.getInformationValidator()
    }

    get maxAmt(): BN {
        return ava.getNetwork().P.minStake
    }

    getInformationValidator() {
        try {
            this.loading = true
            let today = moment()

            this.startTime = moment(new Date(parseInt(this.nodeInfo.startTime) * 1000)).format(
                'MMMM Do YYYY, h:mm:ss a'
            )
            this.endTime = moment(new Date(parseInt(this.nodeInfo.endTime) * 1000)).format(
                'MMMM Do YYYY, h:mm:ss a'
            )
            this.upTime = parseFloat(this.nodeInfo.uptime) * 100

            var reaminingValidationDuration = moment.duration(
                today.diff(moment(new Date(parseInt(this.nodeInfo.startTime) * 1000)))
            )

            let dataReaminingValdiationDuration = {
                days: reaminingValidationDuration.days().toString(),
                hours:
                    reaminingValidationDuration.hours() > 9
                        ? reaminingValidationDuration.hours().toString()
                        : `0${reaminingValidationDuration.hours().toString()}`,
                minutes:
                    reaminingValidationDuration.minutes() > 9
                        ? reaminingValidationDuration.minutes().toString()
                        : `0${reaminingValidationDuration.minutes().toString()}`,
                seconds:
                    reaminingValidationDuration.seconds() > 9
                        ? reaminingValidationDuration.seconds().toString()
                        : `0${reaminingValidationDuration.seconds().toString()}`,
            }

            let strRemainingValidation = `${dataReaminingValdiationDuration.days} Days ${dataReaminingValdiationDuration.hours}h ${dataReaminingValdiationDuration.minutes}m ${dataReaminingValdiationDuration.seconds}s`
            this.reaminingValidation = strRemainingValidation
            this.depositAmount = parseFloat(this.nodeInfo.stakeAmount) / 1000000000
            this.txID = this.nodeInfo.txID
            this.loading = false
        } catch (e) {
            console.error('EROR', e)
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.validator_card {
    display: grid;
    column-gap: 20px;
}

.validator_child_card {
    height: 100%;
}

h4 {
    font-weight: normal;
}
.validator_info > div {
    display: grid;
    grid-template-columns: repeat(5, max-content);
    column-gap: 0px;
    margin-top: 12px;
    > div {
        position: relative;
        padding: 0 24px;
        border-right: 2px solid var(--bg-light);
        &:first-of-type {
            padding-left: 0;
        }
        &:last-of-type {
            border: none;
        }
    }

    label {
        font-size: 20px;
        color: var(--primary-color);
    }

    .icon-mdi-camino {
        font-size: 30px;
        color: var(--primary-color);
    }
}

.disabled_input {
    display: inline-block;
    border-radius: var(--border-radius-sm);
    color: var(--primary-color-light);
    background-color: var(--bg-light);
    padding: 6px 14px;
    white-space: nowrap;
    width: 70%;
}

.disabled_input:focus-visible {
    outline: 0;
}

.input_label {
    margin-bottom: 0.5rem;
}

.amt_in {
    width: 70%;
}
</style>
