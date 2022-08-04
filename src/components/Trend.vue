<template>
    <div class="com-container">
        <!-- 标题大小随屏幕发生变化 -->
        <div class="title" :style="comStyle">
            <span>{{ '▎ ' + ' ' + showTitle }}</span>
            <span class="iconfont icon-arrow-down" @click="showchoice = !showchoice" :style="comStyle"></span>
            <div class="select-con" v-if="showchoice" :style="marginStyle">
                <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleType(item.key)">{{
                        item.text
                }}</div>
            </div>
        </div>
        <div class="com-seller" ref="trend_ref"></div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            charInstance: null,
            Data: null,
            // 控制是否显示下拉菜单
            showchoice: false,
            // 显示数据的类型
            choiceType: 'map',
            // 自适应字体大小
            Size: 0
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
    // 计算属性，依赖于this.Data生成
    computed: {
        // 获取下拉列表的标题
        selectTypes() {
            if (!this.Data) {
                return []
            } else {
                // 去掉原来已经显示的标题
                return this.Data.type.filter(item => {
                    return item.key !== this.choiceType
                })
            }
        },
        // 获取当前要显示的标题
        showTitle() {
            if (!this.Data) {
                return []
            } else {
                return this.Data[this.choiceType].title
            }
        },
        // 标题大小自适应
        comStyle() {
            return {
                fontSize: this.Size + 'px'
            }
        },
        // 下拉框的左外边距，下拉时与当前显示的标题对齐
        marginStyle() {
            return {
                marginLeft: this.Size - 3 + 'px'
            }
        }
    },
    methods: {
        // 初始化echarts对象
        initChart() {
            this.charInstance = this.$echarts.init(this.$refs.trend_ref, 'chalk')
            const initOption = {
                xAxis: {
                    type: 'category',
                    // 去掉x轴刻度
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value'
                },
                // 控制坐标轴在容器内的距离
                grid: {
                    left: '3%',
                    top: '35%',
                    right: '4%',
                    bottom: '1%',
                    // 坐标轴移动包括轴文字
                    containLabel: true
                },
                // 提示框
                tooltip: {
                    // 移动到坐标轴时显示
                    trigger: 'axis'
                },
                // 控制图例
                legend: {
                    left: 20,
                    top: '15%',
                    icon: 'circle'
                }
            }
            this.charInstance.setOption(initOption)
        },
        // 从服务器获取数据
        async getData() {
            const { data: res } = await this.$http.get('/trend')
            this.Data = res
            // 获取数据后渲染到图表
            this.updateChart()
        },
        updateChart() {
            // 半透明颜色值
            const colorArr1 = [
                'rgba(11, 168, 44, 0.5)',
                'rgba(44, 110, 255, 0.5)',
                'rgba(22, 242, 217, 0.5)',
                'rgba(254, 33, 30, 0.5)',
                'rgba(250, 105, 0, 0.5)'
            ]
            // 全透明颜色值
            const colorArr2 = [
                'rgba(11, 168, 44, 0)',
                'rgba(44, 110, 255, 0)',
                'rgba(22, 242, 217, 0)',
                'rgba(254, 33, 30, 0)',
                'rgba(250, 105, 0, 0)'
            ]
            // x轴数据
            const timeArr = this.Data.common.month
            // 当前类型的y轴数据
            const valueArr = this.Data[this.choiceType].data
            const seriesArr = valueArr.map((item, index) => {
                return {
                    name: item.name,
                    type: 'line',
                    // 一条折线图的所有数据
                    data: item.data,
                    stack: this.choiceType,
                    areaStyle: {
                        // 控制颜色从上（0,0）到下（0,1）渐变
                        color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            // 0%的颜色值
                            {
                                offset: 0,
                                color: colorArr1[index]
                            },
                            // 100%的颜色值
                            {
                                offset: 1,
                                color: colorArr2[index]
                            }
                        ])
                    }
                }
            })
            // 图例名称
            const legendArr = valueArr.map(item => {
                return item.name
            })
            var dataOption = {
                xAxis: {
                    data: timeArr
                },
                legend: {
                    data: legendArr
                },
                series: seriesArr
            }
            this.charInstance.setOption(dataOption)
        },
        screenAdapter() {
            this.Size = this.$refs.trend_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                // 图例大小自适应
                legend: {
                    itemWidth: this.Size,
                    itemHeight: this.Size,
                    itemGap: this.Size,
                    textStyle: {
                        fontSize: this.Size / 2
                    }
                }
            }
            this.charInstance.setOption(adapterOption)
            this.charInstance.resize()
        },
        // 点击了下拉标题的某一个
        handleType(currentType) {
            // 修改当前显示的内容
            this.choiceType = currentType
            this.updateChart()
            // 隐藏下拉框
            this.showchoice = false
        }
    }
}
</script>

<style lang="less" scoped>
.title {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 100;
    color: #fff;

    .iconfont {
        margin-left: 10px;
        cursor: pointer;
    }

    .select-con {
        background-color: #222733;

        .select-item {
            cursor: pointer;
        }
    }
}
</style>