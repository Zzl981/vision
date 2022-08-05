<template>
    <div class="com-container">
        <div class="com-seller" ref="stock_ref"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            charInstance: null,
            Data: null,
            currentIndex: 0,
            Timer: null,
            Size: 0
        }
    },
    created() {
        // 组件创建时注册回调函数
        this.$socket.registerCallBack('stockData', this.getData)
    },
    mounted() {
        this.initChart()
        // this.getData()
        this.$socket.send({
            action: 'getData',
            socketType: 'stockData',
            chartName: 'stock',
            value: ''
        })
        // 监听浏览器窗口大小变化
        window.addEventListener('resize', this.screenAdapter)
        // 根据初始窗口大小自适应
        this.screenAdapter(2.8)
    },
    destroyed() {
        // 停止监听窗口变化，防止内存泄露
        window.removeEventListener('resize', this.screenAdapter)
        clearInterval(this.Timer)
        this.$socket.unRegisterCallBack("stockData")
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
            this.screenAdapter(2)
            // 更新图表
            this.updateChart()
        }
    },
    methods: {
        // 初始化echarts对象
        initChart() {
            this.charInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
            const initOption = {
                title: {
                    text: '▎ 库存与销量分析',
                    left: 20,
                    top: 20
                }
            }
            this.charInstance.setOption(initOption)
            this.charInstance.on('mouseover', () => {
                clearInterval(this.Timer)
            })
            this.charInstance.on('mouseout', () => {
                this.startInterval()
            })
        },
        // 从服务器获取数据
        getData(res) {
            // const { data: res } = await this.$http.get('/stock')
            this.Data = res
            // 获取数据后渲染到图表
            this.updateChart()
            this.startInterval()
        },
        updateChart() {
            const centerArr = [
                ['18%', '40%'],
                ['50%', '40%'],
                ['82%', '40%'],
                ['34%', '75%'],
                ['66%', '75%']
            ]
            const colorArr = [
                ['#4FF778','#0BA82C'],
                ['#E5DD45','#E8B11C'],
                ['#E8821C','#E55445'],
                ['#5052EE','#AB6EE5'],
                ['#23E5E5','#2E72BF']
            ]
            const start = this.currentIndex * 5
            const end = (this.currentIndex + 1) * 5
            const showData = this.Data.slice(start, end)
            const seriesArr = showData.map((item, index) => {
                return {
                    type: 'pie',
                    center: centerArr[index],
                    // 关闭鼠标移入圆环时的动画效果
                    hoverAnimation: false,
                    label: {
                        show: true,
                        position: 'center',
                        color: colorArr[index][0],
                        formatter: item.name + '\n' + item.sales,
                        lineHeight: 22
                    },
                    // 去掉指示线
                    labelLine: {
                        show: false
                    },
                    data: [
                        {
                            name: item.name,
                            value: item.sales,
                            itemStyle: {
                                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                                    {
                                        offset: 0,
                                        color: colorArr[index][0]
                                    },
                                    {
                                        offset: 1,
                                        color: colorArr[index][1]
                                    }
                                ])
                            }
                        },
                        {
                            name:item.name,
                            value: item.stock,
                            itemStyle: {
                                color: '#333843'
                            }
                        }
                    ]
                }
            })
            var dataOption = {
                series: seriesArr
            }
            this.charInstance.setOption(dataOption)
        },
        screenAdapter() {
            this.Size = this.$refs.stock_ref.offsetWidth / 100 * 3.6
            const innerRadius = this.Size * 2.4
            const outterRadius = innerRadius * 1.125
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: this.Size
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: [outterRadius, innerRadius],
                        label: {
                            fontSize: this.Size / 2
                        }
                    },
                    {
                        type: 'pie',
                        radius: [outterRadius, innerRadius],
                        label: {
                            fontSize: this.Size / 2
                        }
                    },
                    {
                        type: 'pie',
                        radius: [outterRadius, innerRadius],
                        label: {
                            fontSize: this.Size / 2
                        }
                    },
                    {
                        type: 'pie',
                        radius: [outterRadius, innerRadius],
                        label: {
                            fontSize: this.Size / 2
                        }
                    },
                    {
                        type: 'pie',
                        radius: [outterRadius, innerRadius],
                        label: {
                            fontSize: this.Size / 2
                        }
                    },
                ]
            }
            this.charInstance.setOption(adapterOption)
            this.charInstance.resize()
        },
        startInterval() {
            if(this.Timer) {
                clearInterval(this.Timer)
            }
            this.Timer = setInterval(() => {
                this.currentIndex++
                if(this.currentIndex > 1) {
                    this.currentIndex = 0
                }
                // 更新currentIndex值后需要重新渲染图表
                this.updateChart()
            }, 5000)
        }
    }
}
</script>