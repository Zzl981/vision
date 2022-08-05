<template>
    <div class="com-container">
        <div class="com-seller" ref="hot_ref"></div>
        <span class="iconfont icon-arrow-lift" @click="toLeft" :style="comStyle"></span>
        <span class="iconfont icon-arrow-right" @click="toRight" :style="comStyle"></span>
        <div class="title" :style="comStyle">{{ showTitle }}</div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            charInstance: null,
            Data: null,
            currentIndex: 0,
            Size: 0
        }
    },
    computed: {
        // 右下角的标题
        showTitle() {
            if(!this.Data) {
                return ''
            } else {
                return this.Data[this.currentIndex].name
            }
        },
        // 右下角的标题、箭头大小自适应
        comStyle() {
            return {
                fontSize: this.Size + 'px'
            }
        }
    },
    created() {
        // 组件创建时注册回调函数
        this.$socket.registerCallBack('hotData', this.getData)
    },
    mounted() {
        this.initChart()
        // this.getData()
        this.$socket.send({
            action: 'getData',
            socketType: 'hotData',
            chartName: 'hotproduct',
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
        // 组件销毁时取消回调函数
        this.$socket.unRegisterCallBack("hotData")
    },
    methods: {
        // 初始化echarts对象
        initChart() {
            this.charInstance = this.$echarts.init(this.$refs.hot_ref, 'chalk')
            const initOption = {
                title: {
                    text: '▎ 热销商品的占比',
                    left: 20,
                    top: 20
                },
                legend: {
                    top: '15%',
                    icon: 'circle'
                },
                tooltip: {
                    show: true,
                    formatter: (arg) => {
                        const thirdChildren = arg.data.children
                        var total = 0
                        thirdChildren.forEach(element => {
                            total+= element.value
                        })
                        var str = ''
                        thirdChildren.forEach(element => {
                            str+= `${element.name}:${parseInt(element.value / total * 100) + '%'} <br/>` 
                        })
                        return str
                    }
                },
                series: [
                    {
                        type: 'pie',
                        // 隐藏文字提示
                        label: {
                            show: false
                        },
                        // 高亮时显示文字，隐藏线条
                        emphasis: {
                            label: {
                                show: true
                            },
                            labelLine: {
                                show: false
                            }
                        }
                    }
                ]
            }
            this.charInstance.setOption(initOption)
        },
        // 从服务器获取数据
        getData(res) {
            // const {data: res} = await this.$http.get('/hotproduct')
            this.Data = res
            // 获取数据后渲染到图表
            this.updateChart()
        },
        updateChart() {
            // 图例数据
            const legendArr = this.Data[this.currentIndex].children.map(item => {
                return item.name
            })
            // 每一项二级数据
            const seriesArr = this.Data[this.currentIndex].children.map(item => {
                return {
                    name: item.name,
                    value: item.value,
                    // 便于显示三级标题时使用
                    children: item.children
                }
            })
            var dataOption = {
                legend: {
                    data: legendArr
                },
                series: [
                    {
                        data: seriesArr
                    }
                ]
            }
            this.charInstance.setOption(dataOption)
        },
        screenAdapter() {
            this.Size = this.$refs.hot_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: this.Size
                    }
                },
                legend: {
                    itemWidth: this.Size / 2,
                    itemHeight: this.Size / 2,
                    itemGap: this.Size / 2,
                    textStyle: {
                        fontSize: this.Size / 2
                    }
                },
                series: [
                    {
                        radius: this.Size * 4,
                        center: ['50%','60%']
                    }
                ]
            }
            this.charInstance.setOption(adapterOption)
            this.charInstance.resize()
        },
        // 点击左箭头
        toLeft() {
            this.currentIndex--
            if(this.currentIndex < 0) {
                this.currentIndex = this.Data.length - 1
            }
            this.updateChart()
        },
        // 点击右箭头
        toRight() {
            this.currentIndex++
            if(this.currentIndex > this.Data.length - 1) {
                this.currentIndex = 0
            }
            this.updateChart()
        }
    }
}
</script>

<style lang="less" scoped>
.icon-arrow-lift {
    position: absolute;
    left: 10%;
    top: 60%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
}
.icon-arrow-right {
    position: absolute;
    right: 10%;
    top: 60%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
}
.title {
    position: absolute;
    left: 80%;
    bottom: 20px;
    color: white;
}
</style>