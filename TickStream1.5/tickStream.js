/*
文件名：tickStream.js
描述：tickStream框架的核心代码
author:MingZeY(1552904342@qq.com)
创建日期：2020/3/2
*/


/**
 * 采用最基本的被main用require方式挂载到global
 * require('tickStreamMountExtension')();
 */
module.exports = {

    /**
     * @note 方法列表将会在tickStreamMountExtension挂载到global上
     * @note 这里留个占位体现结构
     */
    funList: {},
    environmentData: {
        isAttack:false,
        isDefense:false,
        isPeace:true
    },

    /**
     * @brife 部署TickStream
     * @param isCompulsive 布尔值：决定是否强制重新部署，此参数仅供开发用，不填即可，慎用
     */
    deploy: function (isCompulsive) {
        //检查是否已经部署
        if ((!isCompulsive)
            && "TickStream" in Memory
            && "Version" in Memory.TickStream) {
            return "TickStream 已部署过了，请undeploy后再重新部署";
        }
        Memory.TickStream = {};//根
        Memory.TickStream.Version = "1.5";//TickStream版本号
        Memory.TickStream.averageCPU = 0;//TickStream的平均耗时

        Memory.TickStream.GUI = {};//GUI对象使用空间
        Memory.TickStream.GUI.isShow = true;//默认开启的GUI显示
        Memory.TickStream.GUI.Bucket = { x: 1, y: 1, width: 10, height: 1 };//Bucket视图
        Memory.TickStream.GUI.CPU = { x: 1, y: 2, width: 10, height: 1 };//CPU视图
        Memory.TickStream.GUI.ExecutionEfficiency = { x: 1, y: 3, width: 10, height: 1 };//执行效率视图
        Memory.TickStream.GUI.SystemConsumption = { x: 1, y: 4, width: 10, height: 1 };//系统消耗视图
        Memory.TickStream.GUI.MethodLoad = { x: 1, y: 5, width: 10, height: 1 };//负载视图
        Memory.TickStream.GUI.Room = {};//用于单独设置每个房间的GUI 保留

        Memory.TickStream.Register = {};
        Memory.TickStream.Register.FunList = {};

        Memory.TickStream.Algorithm = {};//提供给算法用的空间

        /**
         * 刷新注册表
         * 为了防止main写入代码并部署后，Memory不存在FunList导致Runner无法读取产生的错误
         */
        global.tickStream.Register.refresh();

        return "TickStream 已部署完成，版本" + Memory.TickStream.Version;
    },

    /**
     * @brife 取消部署
     * @note 清空TickStream痕迹,请在控制台使用Game.tickStream.undeploy()来取消部署
     * @note 若要完全恢复之前状态，您还需对main.js进行一些处理
     */
    undeploy: function () {
        delete Memory.TickStream;
        return "TickStream 已取消部署，感谢使用！";
    },

    /**
     * 注册表对象
     */
    Register: {
        /**
        * @brife 刷新注册表，去除多余的Memory
        */
        refresh: function () {

        },


        /**
         * @brife 处理一个方法运行完后的数据并处理注册表
         * @param name 这个方法的名字
         * @param cpu 这个方法单次运行的时间
         */
        refreshFun: function (funName, cpu) {

            let funList = Memory.TickStream.Register.FunList;
            let oCPU = 0;
            let nCPU = cpu;

            //获取oCPU
            if (!(funName in Memory.TickStream.Register.FunList)) {
                //不存在，创建
                funList[funName] = {
                    averageCPU: 0,
                    maxCPU: cpu,
                    minCPU: cpu,
                    runTimes: 0,
                    registerTick: Game.time
                };
            } else {
                //获取这个方法的cpu
                oCPU = funList[funName].averageCPU;
                if (oCPU == null || isNaN(oCPU)) { oCPU = nCPU }
            }

            let funObj = funList[funName];

            //取平均
            let aCPU = ((Number(oCPU) + Number(nCPU)) / 2);
            funObj.averageCPU = aCPU;

            //最大最小值
            let maxCPU = funObj.maxCPU;
            let minCPU = funObj.minCPU;
            if (nCPU > maxCPU) {
                funObj.maxCPU = nCPU;
            } else if (nCPU < minCPU) {
                funObj.minCPU = nCPU;
            }

            //每运行50次刷新数据
            if (funObj.runTimes % 50 == 0) {
                funObj.maxCPU = aCPU;
                funObj.minCPU = aCPU;
            }

            funObj.runTimes++;
        }

    },

    /**
     * GUI对象
     * 控制资源显示
     */
    GUI: {
        /**
        * @brief 设置TSGUI状态
        * @param isShow 传入布尔值用以开启或关闭GUI显示
        * @note 请在控制台使用这个方法
        */
        set: function (isShow) {
            if (isShow) {
                Memory.TickStream.GUI.isShow = true;
            } else {
                Memory.TickStream.GUI.isShow = false;
            }
        },

        /**
        * @brife 显示TSGUI
        */
        show: function () {
            //是否绘制
            if (!Memory.TickStream.GUI.isShow) { return -1 };

            const RED = "#EF5350";
            const WHITE = "#FFF";
            const YELLOW = "#FFC107";
            const GREEN = "#4CAF50";

            let layout = Memory.TickStream.GUI;
            let view = new RoomVisual();

            //Bucket绘制
            let bucketLimit = 10000;
            let bucketFree = Game.cpu.bucket;
            view.text(
                "Bucket 剩余：" + parseInt(bucketFree / bucketLimit * 100) + "%(" + bucketFree + "/" + bucketLimit + ")",
                layout.Bucket.x,
                layout.Bucket.y,
                {
                    align: 'left'
                }
            );

            //CPU绘制
            //获取cpu数值
            let cpu = Number(global.tickStream.environmentData.cpu).toFixed(2);
            if (isNaN(cpu)) { cpu = "计算中"; }
            view.text(
                "平均CPU：" + cpu + "/20ms",
                layout.CPU.x,
                layout.CPU.y,
                {
                    align: 'left',
                    color: (cpu > 20) ? RED : WHITE
                }
            );

            //执行效率绘制
            //获取本Tick没有完成的方法数量
            let unexecutedFunSize = global.tickStream.environmentData.unexecutedFunSize;
            //获取本应完成的方法数量
            let allFunSize = global.tickStream.environmentData.allFunSize;

            let rate;
            if (allFunSize == 0) {
                rate = 1;
            } else {
                rate = 1 - (unexecutedFunSize / allFunSize);
            }
            if (isNaN(rate)) { rate = "计算中"; } else {
                rate = (Number(rate).toFixed(2)) * 100;
            }

            view.text(
                "执行效率：" + rate + "%",
                layout.ExecutionEfficiency.x,
                layout.ExecutionEfficiency.y,
                {
                    align: 'left',
                    color: (rate < 70) ? RED : ((rate < 90) ? YELLOW : GREEN)
                }
            );

            //执行效率绘制
            let time = Memory.TickStream.averageCPU;
            view.text(
                "TickStram 系统平均消耗CPU：" + time + "ms",
                layout.SystemConsumption.x,
                layout.SystemConsumption.y,
                {
                    align: 'left'
                }
            );

        },
    },

    /**
     * 权重计算对象
     */
    WeightSystem: {

        /**
         * @brife 返回下一个Tick的执行策略
         * @return 一个包含queue和runTimeLimit的对象，该返回值应该正确的被LinkedQueue配合Runner使用
         */
        returnNextTickResult: function () {
            let FunList = global.tickStream.funList;
            let NextQueue = new global.tickStream.LinkedQueue.creat();
            let Algorithm = global.tickStream.Algorithm;
            let MemorySpace = Memory.TickStream.Algorithm;
            let isRefresh = global.tickStream.isRefresh;
            let LinkedQueue = global.tickStream.LinkedQueue;
            let tickLimiti = Game.cpu.tickLimit;

            /** 
             * Require TickStreamAlgorithm.js
             * TickStreamAlgorithm中包含了玩家可自定义的算法
            */

            let runTimeLimit = 20;
            try {
                runTimeLimit = require('tickStreamAlgorithm')(FunList, NextQueue, Algorithm,MemorySpace,isRefresh,LinkedQueue,tickLimiti);
            } catch (e) {
                let NextQueue = new global.tickStream.LinkedQueue.creat();
                console.log(e.stack + '\nTickStream温馨提示：您的算法出现语法错误 At GameTime:'+Game.time);
                let view = new RoomVisual();
                view.text("TickStream算法出现错误", 25, 25, { font: 2, color: "#F44336", stroke: "#fff", strokeWidth: 0.5 });
                view.text("请前往tickStreamAlgorithm.js检查问题", 25, 27, { stroke: "#000" });
            }

            /**
             * 封装返回对象
             */
            let returnObj = {
                queue: NextQueue,
                runTimeLimit: runTimeLimit
            }
            return returnObj;
        }
    },

    /**
     * 队列链表处理对象
     */
    LinkedQueue: {

        /**
         * @brife 创建一个队列链表
         */
        creat: function () {

            /**
             * Node节点 
             */
            let Node = function (ele) {
                this.ele = ele;
                this.next = null;
            }

            let length = 0, front, rear;

            /**
             * 入队，尾部
             */
            this.push = function (ele) {
                let node = new Node(ele);
                let temp;

                if (length == 0) {
                    front = node;
                } else {
                    temp = rear;
                    temp.next = node;
                }

                rear = node;
                length++;

                return true;
            }

            /**
             * 出队，头部
             */
            this.pop = function () {
                if(length == 0){
                    return null;
                }
                let temp = front;
                front = front.next;
                length--;
                temp.next = null;
                return temp.ele;
            }

            /**
             * 入队，头部
             */
            this.pushHead = function(ele){
                let node = new Node(ele);
                let temp = front;

                front = node;
                front.next = temp;
                
                length++;
                
                return true;
            }

            /**
             * 返回队列链表的长度
             */
            this.getLength = function () {
                return length;
            }

            /**
             * 输出队列链表的内容
             */
            this.toString = function () {
                let str = '';
                let temp = front;
                while (temp) {
                    str += temp.ele + ' ';
                    temp = temp.next;
                }
                return str;
            }

            /**
             * 清空队列链表
             */
            this.clear = function () {
                front = null;
                rear = null;
                length = 0;
                return true;
            }

            this.getFront = function(){
                return front;
            }

            this.getRear = function(){
                return rear;
            }
        },

        /**
         * @brife 将两个链表头尾链接起来
         * @param {*} linkObj 
         * @param {*} queue 
         */
        pushLink: function (linkObj, queue) {
            while (queue.getLength() > 0) {
                let temp = queue.pop();
                linkObj.push(temp);
            }
        }

    },

    /**
     * 执行对象
     */
    Runner: {

        /**
         * @brife 运行一个方法并记录数据
         * @param {*} funItem 该方法的合法对象，合法对象应该具有funName,funObj,options，请参考FunList文档
         */
        run: function (funItem) {

            //记录起始CPU
            let startT = Game.cpu.getUsed();
            funItem.funObj();
            let endT = Game.cpu.getUsed();
            let cost = endT - startT;
            return {
                type: 'funRunningResult',
                data: {
                    funName: funItem.funName,
                    consumption: cost
                }
            }
        }
    },

    /**
     * 集中反馈对象
     * @note Feedback并不是一个多余的对象，由于TickStream内部对象间的交互会很复杂，Feedback被我设计为所有数据流经的通道，因此Feedback可以更好的集中数据并反馈到Memory或者NotifyEmail
     */
    Feedback: {

        /**
         * 记录TickStream的系统耗时
         */
        tickConsuming: function (time) {
            let time1 = Memory.TickStream.averageCPU;
            time1 = Number(time1);
            time = Number(time);
            if (isNaN(time1)) { time1 = 0 };
            if (isNaN(time)) { time = 0 };
            let time2 = (time1 + time) / 2;
            Memory.TickStream.averageCPU = time2.toFixed(2);
        },

        /**
         * Tick结束
         */
        tickEnd: function () {

        },

        /**
         * @brife 读取反馈消息
         * @param msg 
         */
        read: function (msg) {

            //判断msg类型
            switch (msg.type) {
                /**
                 * 方法运行结果：发送给Register处理
                 */
                case 'funRunningResult':
                    global.tickStream.Register.refreshFun(msg.data.funName, msg.data.consumption);
                    break;

                /**
                 * 一个Tick结束后的反馈
                 */
                case 'tickRunningResult':
                    //记录到global
                    global.tickStream.environmentData.cpu = msg.data.cpu;
                    global.tickStream.environmentData.allFunSize = msg.data.allFunSize;
                    global.tickStream.environmentData.unexecutedFunSize = msg.data.unexecutedFunSize;
                    break;

                case 'errNotify':
                    break;

                default:

            }
        },

        /**
         * @brife 发送消息给目标对象并返回回复
         * @param {*} target 
         * @param {*} msg 
         */
        send: function (target, msg) {
            switch (msg) {
                case 'nextTick':
                    //调用target(WeightSystem)计算
                    let reply = target.returnNextTickResult();
                    return reply;

                default:
            }
        },

        /**
         * @brife 占位，用于反馈错误消息到console或者NotifyEmail
         */
        errReport: function () {

        },

        /**
         * @brife 发送TickStream专属消息到NotifyEmail
         */
        sendNotifyEmail: function () {

        }
    },

    /**
     * Algorithm对象，便于玩家开发算法的对象
     */
    Algorithm: {
        get: {
            averageCPUByName: function (name) {
                try {
                    if (Memory.TickStream.Register.FunList[name]) {
                        return Memory.TickStream.Register.FunList[name].averageCPU;
                    }
                    return 0;
                } catch (e) {
                    return -1;
                }
            },
            averageCPUByObj: function (obj) {
                try {
                    let name = obj.funName;
                    return Memory.TickStream.Register.FunList[name].averageCPU;
                } catch (e) {
                    //console.log(e.stack);
                    return -1;
                }
            },
            maxCPUByName: function (name) {
                try {
                    if (Memory.TickStream.Register.FunList[name]) {
                        return Memory.TickStream.Register.FunList[name].maxCPU;
                    }
                } catch (e) {
                    return -1;
                }
            },
            maxCPUByObj: function (obj) {
                try {
                    let name = obj.funName;
                    return Memory.TickStream.Register.FunList[name].maxCPU;
                } catch (e) {
                    //console.log(e.stack);
                    return -1;
                }
            },
            minCPUByName: function (name) {
                try {
                    if (Memory.TickStream.Register.FunList[name]) {
                        return Memory.TickStream.Register.FunList[name].minCPU;
                    }
                } catch (e) {
                    return -1;
                }
            },
            minCPUByObj: function (obj) {
                try {
                    let name = obj.funName;
                    return Memory.TickStream.Register.FunList[name].minCPU;
                } catch (e) {
                    //console.log(e.stack);
                    return -1;
                }
            },

            freeBucket:function(){
                return Game.cpu.bucket;
            },

            freeBucketRate:function(){
                return Game.cpu.bucket/10000*100;
            }

        },
        environment: {
            setInAttack:function(){
                global.TickStream.environmentData.isAttack = true;
                global.TickStream.environmentData.isPeace = false;
            },

            setINDefense:function(){
                global.TickStream.environmentData.isDefense = true;
                global.TickStream.environmentData.isPeace = false;
            },

            setInPeace:function(){
                global.TickStream.environmentData.isAttack = false;
                global.TickStream.environmentData.isDefense = false;
                global.TickStream.environmentData.isPeace = true;
            }

        }
    }

};