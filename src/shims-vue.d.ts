declare module '*.vue' {
    import Vue from 'vue'

    interface ComponentOptions<V extends Vue> {
        metaInfo?: any
    }

    export default Vue
}
