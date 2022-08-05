<template>
    <div class="com-container">
        <div class="com-seller" ref="seller_ref"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            charInstance: null,
            Data: null,
            currentPage: 1,
            totalPage: 0,
            Timer: null
        }
    },
    created() {
        // 组件创建时注册回调函数
        this.$socket.registerCallBack('sellerData', this.getData)
    },
    // 页面开始加载时的调用的事件
    mounted() {
        this.initChart()
        // this.getData()
        this.$socket.send({
            action: 'getData',
            socketType: 'sellerData',
            chartName: 'seller',
            value: ''
        })
        // 监听浏览器窗口大小变化
        window.addEventListener('resize', this.screenAdapter)
        // 根据初始窗口大小自适应
        this.screenAdapter()
    },
    destroyed() {
        // 组件销毁时清除定时器
        clearInterval(this.Timer)
        // 停止监听窗口变化，防止内存泄露
        window.removeEventListener('resize', this.screenAdapter)
        // 组件销毁时取消回调函数
        this.$socket.unRegisterCallBack("sellerData")
    },
    computed: {
        // 定义theme计算属性
        ...mapState(['theme'])
    },
    watch: {
        theme() {
            // 销毁原来的主题
            this.charInstance.dispose()
            // 以最新的主题重新初始化图表
            this.initChart()
            // 重新调整自适应大小
            this.screenAdapter()
            // 更新图表
            this.updateChart()
        }
    },
    methods: {
        // 初始化echarts对象
        initChart() {
            this.charInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
            const initOption = {
                title: {
                    text: '▎商家销售统计',
                    left: 20,
                    top: 15
                },
                animationEasing: 'circularOut',
                grid: {
                    top: '20%',
                    left: '6%',
                    right: '3%',
                    bottom: '3%',
                    containLabel: true //距离包含坐标上的文字
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'category'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                        z: 0,
                        lineStyle: {
                            color: '#2D3443',
                            type: 'solid'
                        }
                    }
                },
                series: [
                    {
                        type: 'bar',
                        label: {
                            show: true,
                            position: 'right',
                            textStyle: {
                                color: 'white'
                            }
                        },
                        itemStyle: {
                            barBorderRadius: [0, 33, 33, 0],
                            color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                // 0%状态下的颜色
                                {
                                    offset: 0,
                                    color: '#5052EE'
                                },
                                // 100%状态下的颜色
                                {
                                    offset: 1,
                                    color: '#AB6EE5'
                                }
                            ])
                        }
                    }
                ]
            }
            this.charInstance.setOption(initOption)
            // 鼠标经过时停止定时器
            this.charInstance.on('mouseover', () => {
                clearInterval(this.Timer)
            })
            // 鼠标离开时重新开启定时器
            this.charInstance.on('mouseout', () => {
                this.updatePage()
            })
        },
        // 从服务器获取数据
        getData(res) {
            // const { data: res } = await this.$http.get('/seller')
            this.Data = res
            // 从小到大排序
            this.Data.sort((a, b) => {
                return a.value - b.value
            })
            // 总页数
            this.totalPage = this.Data.length % 5 === 0 ? this.Data.length / 5 : this.Data.length / 5 + 1
            // 获取数据后渲染到图表
            this.updateChart()
            // 每隔3秒改变图表渲染的数据
            this.updatePage()
        },
        updateChart() {
            const start = (this.currentPage - 1) * 5
            const end = this.currentPage * 5
            // 筛选需要渲染到页面的数据
            const showData = this.Data.slice(start, end)
            const sellerNames = showData.map((item) => {
                return item.name
            })
            const sellerValues = showData.map((item) => {
                return item.value
            })
            var dataOption = {
                yAxis: {
                    data: sellerNames
                },
                series: [
                    {
                        data: sellerValues,
                    }
                ]
            }
            this.charInstance.setOption(dataOption)
        },
        updatePage() {
            // 如果有定时器就先清除
            if (this.Timer) {
                clearInterval(this.Timer)
            }
            this.Timer = setInterval(() => {
                this.currentPage++
                if (this.currentPage > this.totalPage) {
                    this.currentPage = 1
                }
                this.updateChart()
            }, 3000)
        },
        screenAdapter() {
            const Size = this.$refs.seller_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: Size
                    }
                },
                tooltip: {
                    axisPointer: {
                        lineStyle: {
                            width: Size
                        }
                    }
                },
                series: [
                    {
                        barWidth: Size
                    }
                ]
            }
            this.charInstance.setOption(adapterOption)
            this.charInstance.resize()
        }
    }
}
</script>

<style lang="less" scoped>
</style>