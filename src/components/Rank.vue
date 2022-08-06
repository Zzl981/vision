<template>
    <div class="com-container">
        <div class="com-seller" ref="rank_ref"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            charInstance: null,
            Data: null,
            // 区域控制开始位置
            startValue: 0,
            // 区域控制结束位置
            endValue: 9,
            // 定时器
            Timer: null
        }
    },
    created() {
        // 组件创建时注册回调函数
        this.$socket.registerCallBack('rankData', this.getData)
    },
    mounted() {
        this.initChart()
        // this.getData()
        this.$socket.send({
            action: 'getData',
            socketType: 'rankData',
            chartName: 'rank',
            value: ''
        })
        // 监听浏览器窗口大小变化
        window.addEventListener('resize', this.screenAdapter)
        // 根据初始窗口大小自适应
        this.screenAdapter()
    },
    destroyed() {
        // 停止监听窗口变化，防止内存泄露
        window.removeEventListener('resize', this.screenAdapter)
        clearInterval(this.Timer)
        // 组件销毁时取消回调函数
        this.$socket.unRegisterCallBack("rankData")
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
            // 隐藏加载动画
            this.charInstance.hideLoading()
            // 重新调整自适应大小
            this.screenAdapter()
            // 更新图表
            this.updateChart()
        }
    },
    methods: {
        // 初始化echarts对象
        initChart() {
            this.charInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
            // 请求数据前显示加载数据中动画
            this.charInstance.showLoading()
            const initOption = {
                title: {
                    text: '▎ 地区销售排行',
                    left: 20,
                    top: 20
                },
                grid: {
                    top: '40%',
                    right: '5%',
                    bottom: '5%',
                    left: '5%',
                    containLabel: true
                },
                tooltip: {
                    show: true
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        type: 'bar',
                        itemStyle: {
                             barBorderRadius: [33, 33, 0, 0]
                        }
                    }
                ]
            }
            this.charInstance.setOption(initOption)
            // 监听鼠标经过和离开事件
            this.charInstance.on('mouseover', () => {
                clearInterval(this.Timer)
            })
            this.charInstance.on('mouseout', () => {
                this.startInterval()
            })
        },
        // 从服务器获取数据
        getData(res) {
            // 隐藏加载动画
            this.charInstance.hideLoading()
            // const { data: res } = await this.$http.get('/rank')
            this.Data = res
            this.Data.sort((a, b) => {
                return b.value - a.value
            })
            // 获取数据后渲染到图表
            this.updateChart()
            this.startInterval()
        },
        updateChart() {
            const colorArr = [
                ['#0BA82C', '#4FF778'],
                ['#2E72BF', '#23E5E5'],
                ['#5052EE', '#AB6EE5']
            ]
            const provinceArr = this.Data.map(item => {
                return item.name
            })
            const valueArr = this.Data.map(item => {
                return item.value
            })
            var dataOption = {
                xAxis: {
                    data: provinceArr
                },
                // 控制区域缩放
                dataZoom: {
                    show: false,
                    startValue: this.startValue,
                    endValue: this.endValue
                },
                series: [
                    {
                        data: valueArr,
                        itemStyle: {
                            color: (arg) => {
                                var targetColor = null
                                if (arg.value > 300) {
                                    targetColor = colorArr[0]
                                } else if (arg.value > 200) {
                                    targetColor = colorArr[1]
                                } else {
                                    targetColor = colorArr[2]
                                }
                                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {
                                        offset: 0,
                                        color: targetColor[0]
                                    },
                                    {
                                        offset: 1,
                                        color: targetColor[1]
                                    }
                                ])
                            }
                        }
                    }
                ]
            }
            this.charInstance.setOption(dataOption)
        },
        screenAdapter() {
            const Size = this.$refs.rank_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: Size
                    }
                },
                series: {
                    barWidth: Size
                }
            }
            this.charInstance.setOption(adapterOption)
            this.charInstance.resize()
        },
        startInterval() {
            if (this.Timer) {
                clearInterval(this.Timer)
            }
            this.Timer = setInterval(() => {
                this.startValue++
                this.endValue++
                if (this.endValue > this.Data.length - 1) {
                    this.startValue = 0
                    this.endValue = 9
                }
                this.updateChart()
            }, 2000)
        }
    }
}
</script>