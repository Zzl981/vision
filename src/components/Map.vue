<template>
    <div class="com-container" @dblclick="backToChina">
        <div class="com-seller" ref="map_ref"></div>
    </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'
import { mapState } from 'vuex'
export default {
    data() {
        return {
            charInstance: null,
            Data: null,
            mapData: {} //用于缓存读取到的省份地图矢量数据
        }
    },
    created() {
        // 组件创建时注册回调函数
        this.$socket.registerCallBack('mapData', this.getData)
    },
    mounted() {
        this.initChart()
        // this.getData()
        this.$socket.send({
            action: 'getData',
            socketType: 'mapData',
            chartName: 'map',
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
        this.$socket.unRegisterCallBack("mapData")
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
        async initChart() {
            this.charInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
            // 请求数据前显示加载数据中动画
            this.charInstance.showLoading()
            const res = await axios.get('http://127.0.0.1:8080/static/map/china.json')
            this.$echarts.registerMap('china', res.data)
            const initOption = {
                title: {
                    text: '▎商家分布',
                    left: 20,
                    top: 20
                },
                geo: {
                    type: 'map',
                    map: 'china',
                    top: '5%',
                    bottom: '5%',
                    itemStyle: {
                        areaColor: '#2E72BF',
                        borderColor: '#333'
                    }
                },
                legend: {
                    left: '5%',
                    bottom: '5%',
                    orient: 'vertical'
                }
            }
            this.charInstance.setOption(initOption)
            // 监听地图的点击事件
            this.charInstance.on('click', async (res) => {
                const provinceInfo = getProvinceMapInfo(res.name)
                // 如果缓存中数据则不发起请求
                if (!this.mapData[provinceInfo.key]) {
                    const ret = await axios.get('http://127.0.0.1:8080' + provinceInfo.path)
                    this.mapData[provinceInfo.key] = ret.data
                    this.$echarts.registerMap(provinceInfo.key, ret.data)
                }
                const provinceOption = {
                    geo: {
                        map: provinceInfo.key
                    }
                }
                this.charInstance.setOption(provinceOption)
            })
        },
        // 从服务器获取数据
        getData(res) {
            // 隐藏加载动画
            this.charInstance.hideLoading()
            // 获取数据后渲染到图表
            // const { data: res } = await this.$http.get('/map')
            this.Data = res
            this.updateChart()
        },
        // 渲染数据
        updateChart() {
            const seriesArr = this.Data.map(item => {
                // 返回的是一个类别的对象
                return {
                    type: 'effectScatter',
                    rippleEffect: {
                        scale: 5,
                        brushType: 'stroke'
                    },
                    name: item.name,
                    data: item.children,
                    // 散点图必须要使用地图坐标系统才能显示出来
                    coordinateSystem: 'geo'
                }
            })
            const legendData = this.Data.map(item => {
                return item.name
            })
            var dataOption = {
                legend: {
                    data: legendData
                },
                series: seriesArr
            }
            this.charInstance.setOption(dataOption)
        },
        // 图表随屏幕变化自适应变化
        screenAdapter() {
            const Size = this.$refs.map_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: Size
                    }
                },
                legend: {
                    itemWidth: Size / 2,
                    itemHeight: Size / 2,
                    itemGap: Size / 2,
                    textStyle: {
                        fontSize: Size / 2
                    }
                }
            }
            this.charInstance.setOption(adapterOption)
            this.charInstance.resize()
        },
        // 双击返回中国地图
        backToChina() {
            const option = {
                geo: {
                    map: 'china'
                }
            }
            this.charInstance.setOption(option)
        }
    }
}
</script>