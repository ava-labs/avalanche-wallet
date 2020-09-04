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
                v-model="fromDateVal"
                no-title
                @input="fromDateMenu = false"

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
            fromDateVal: null,

            // minDate: "2019-07-04",
            // maxDate: "2019-08-30",
        };
    },
    computed: {
        fromDateDisp() {
            return this.fromDateVal;
            // format date, apply validations, etc. Example below.
            // return this.fromDateVal ? this.formatDate(this.fromDateVal) : "";
        },
    },
};
</script>
<style scoped lang="scss">
.layout{
    margin: 0;
}
</style>
