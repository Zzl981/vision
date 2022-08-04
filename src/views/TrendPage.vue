<template>
    <div class="com-page">
        <v-trend></v-trend>
    </div>
</template>

<script>
import Trend from '../components/Trend.vue'
    export default {
    data() {
        return {};
    },
    methods: {},
    components: { 
        'v-trend': Trend
     }
}
</script>

<style lang="less" scoped>

</style>