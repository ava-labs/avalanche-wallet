<template>
    <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
            <button
                    v-bind="attrs"
                    v-on="on"
            >
                <slot></slot>
            </button>
        </template>
        <span>{{text}}</span>
    </v-tooltip>
</template>
<script>
    export default {
        props: {
            text: String
        }
    }
</script>