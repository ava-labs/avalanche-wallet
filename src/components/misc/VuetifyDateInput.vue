<template>
    <v-layout row wrap>
        <v-menu
            v-model="fromDateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
        >
            <template v-slot:activator="{ on }">
                <v-text-field
                    :label="label"
                    readonly
                    :value="fromDateDisp"
                    v-on="on"
                    hide-details
                ></v-text-field>
            </template>
            <v-date-picker
                locale="en-in"
                :min="minDate"
                :max="maxDate"
                v-model="dateVal"
                no-title
                @input="dateIn"
            ></v-date-picker>
        </v-menu>
    </v-layout>
</template>
<script>
export default {
    props: {
        label: String,
        minDate: String,
        maxDate: String,
    },
    data() {
        return {
            fromDateMenu: false,
            dateVal: null,

            // minDate: "2019-07-04",
            // maxDate: "2019-08-30",
        }
    },
    computed: {
        fromDateDisp() {
            return this.dateVal
            // format date, apply validations, etc. Example below.
            // return this.fromDateVal ? this.formatDate(this.fromDateVal) : "";
        },
    },
    methods: {
        dateIn() {
            this.fromDateMenu = false
            // console.log(this.dateVal);
        },
    },
    watch: {
        dateVal(val) {
            // console.log(val);
            this.$emit('change', val)
        },
    },
}
</script>
<style scoped lang="scss">
.layout {
    margin: 0;
}
</style>
