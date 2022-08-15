<template functional>
    <div class="utxo" :income="props.amount > 0">
        <p class="action">
            {{ $options.getActionText(props.type, props.amount, props.operationDirection) }}
        </p>
        <p
            class="amount"
            :style="{
                color: $options.getColor(props.type, props.amount),
            }"
        >
            {{ props.amount }}
            <!--            {{ amountText }} {{ symbolText }}-->
        </p>
    </div>
</template>
<script>
export default {
    props: {
        amount: Number,
        assetId: String,
        type: String,
        operationDirection: String,
    },

    getColor(type, amount) {
        // if (this.type === 'operation') return this.operationColor
        if (type === 'add_validator') return '#008dc5'
        if (type === 'add_delegator') return '#008dc5'

        if (amount > 0) {
            return '#6BC688'
        } else if (amount === 0) {
            return '#999'
        } else {
            return '#d04c4c'
        }
    },

    getActionText(type, amount, operationDirection) {
        let isIncome = amount > 0

        switch (type) {
            case 'base':
                if (isIncome) {
                    return 'Received'
                }
                return 'Sent'
            case 'operation':
                return operationDirection
            default:
                // Capitalize first letter
                return type
                    .split('_')
                    .map((value) => value[0].toUpperCase() + value.substring(1))
                    .join(' ')
        }
    },
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.utxo {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 10px;

    > * {
        align-self: center;
    }

    &:not(:first-child) {
        .action {
            visibility: hidden;
        }
    }
}

.action {
    font-size: 12px;
    color: main.$primary-color-light;
}
.amount {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
}

@include main.medium-device {
    .amount {
        font-size: 14px;
    }
}
</style>
