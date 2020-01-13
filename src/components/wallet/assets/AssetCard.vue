<template>
    <div>
        <div>
            <p>{{asset.title}}</p>
            <p>{{asset.key}}</p>
        </div>
        {{selected}}
        <div v-if="selected">SELECTED</div>
    </div>
</template>
<script>
    export default {
        props: {
            asset: Object,
            selected: {
                type: Boolean,
                default: false,
            },
        }
    }
</script>