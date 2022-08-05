export default class SocketService {
    static instance = null
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }

    // 连接服务器的socket对象
    ws = null
    // 存储回调函数
    callBackMapping = {}
    //用于判断连接状态
    connected = false
    // 统计发送数据请求的次数
    sendCounts = 0
    // 尝试重连的次数
    connectRetryCounts = 0
    // 定义和服务器连接的方法
    connect() {
        if (!window.WebSocket) {
            return console.log('您的浏览器不支持WebSocket');
        }
        this.ws = new WebSocket('ws:localhost:9998')

        this.ws.onopen = () => {
            console.log('连接服务端成功');
            this.connected = true
            this.connectRetryCounts = 0
        }

        this.ws.onclose = () => {
            console.log('连接服务端失败');
            this.connected = false
            // 尝试次数累加
            this.connectRetryCounts++
            setTimeout(() => {
                this.connect()
            }, this.connectRetryCounts * 500);
        }

        this.ws.onmessage = (msg) => {
            console.log('接收到服务端数据');
            // console.log(msg.data);
            // 将字符串数据转为JSON字符串数据
            const recData = JSON.parse(msg.data)
            // 判断什么类型的数据
            const socketType = recData.socketType
            // 若存在相应的回调函数
            if (this.callBackMapping[socketType]) {
                // 获取action值
                const action = recData.action
                if (action === 'getData') {
                    // 将真正的图表数据转为JSON格式
                    const realData = JSON.parse(recData.data)
                    // 调用回调函数
                    this.callBackMapping[socketType].call(this, realData)
                } else if (action === 'fullScreen') {

                } else {

                }
            }
        }
    }

    // 注册回调函数
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    // 清空回调函数
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }

    // 定义浏览器发送数据的方法
    send(data) {
        // 如果还存在连接，则直接发送数据
        if (this.connected) {
            this.sendCounts = 0
            // 转为普通字符串
            this.ws.send(JSON.stringify(data))
        } else {
            this.sendCounts++
            // 延迟500毫秒再发送，请求次数越多，时间间隔越长
            setTimeout(() => {
                this.send(data)
            }, this.sendCounts * 500)
        }

    }
}