<template>
    <div class="com-page">
        <v-stock></v-stock>
    </div>
</template>

<script>
import Stock from '../components/Stock.vue'
    export default {
    data() {
        return {};
    },
    methods: {},
    components: { 
        'v-stock': Stock
     }
}
</script>

<style lang="less" scoped>

</style>