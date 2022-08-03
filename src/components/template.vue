<template>
    <div class="com-container">
        <div class="com-seller" ref="seller_ref"></div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            charInstance: null,
            Data: null
        }
    },
    mounted() {
        this.initChart()
        this.getData()
        // 监听浏览器窗口大小变化
        window.addEventListener('resize', this.screenAdapter)
        // 根据初始窗口大小自适应
        this.screenAdapter()
    },
    destroyed() {
        // 停止监听窗口变化，防止内存泄露
        window.removeEventListener('resize', this.screenAdapter)
    },
    methods: {
        // 初始化echarts对象
        initChart() {
            this.charInstance = this.$echarts.init(this.$refs.seller_ref)
            const initOption = {}
            this.charInstance.setOption(initOption)
        },
        // 从服务器获取数据
        async getData() {
            // 获取数据后渲染到图表
            this.updateChart()
        },
        updateChart() {
            var dataOption = {}
            this.charInstance.setOption(dataOption)
        },
        screenAdapter() {
            const adapterOption = {}
            this.charInstance.setOption(adapterOption)
            this.charInstance.resize()
        }
    }
}
</script>