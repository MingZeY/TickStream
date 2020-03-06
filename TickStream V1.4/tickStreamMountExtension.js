
//挂载执行扩展JS
module.exports = function (funList) {

    //记录TickStream的耗时
    let timeStartForTS = Game.cpu.getUsed();

    //判断TickStream是否已经部署
    if (!("TickStream" in Memory
        && "Version" in Memory.TickStream)) {
        //未部署，提示部署
        let view = new RoomVisual();
        view.text("TickStream已就绪，请立即部署", 25, 25, { font: 2, color: "#4CAF50", stroke: "#fff", strokeWidth: 0.5 });
        view.text("在控制台键入global.tickStream.deploy()以部署", 25, 27, { stroke: "#000" });

        //持续挂载TickStream到global上便于玩家启动部署
        global.tickStream = require('tickStream');

        //若未部署，return跳出TickStream的运行
        return -1;
    }

    /**
     * 将TickStream和funList挂载到global上
     */
    if (!global.hasTickStream) {
        //挂载TickStream
        global.tickStream = require('tickStream');
        global.tickStream.funList = funList;

        //刷新Register
        //global.tickStream.Register.refresh();
        //global.tickStream.Register.synchronization();
        console.log("Global 已刷新 TickStrem 已经重新挂载并缓存");

        //重置挂载失效标识
        global.hasTickStream = true;
    }

    /** 
     * 主方法开始
    */
    let TickStream = global.tickStream;//下面的爸爸
    let GUI = TickStream.GUI;//可视化界面管理的相关内容
    let WeightSystem = TickStream.WeightSystem;//权重系统，分析并向LinkedQueue派遣队列
    let LinkedQueue = TickStream.LinkedQueue;//队列链表，储存并管理需要被执行队列，派遣方法给Runner
    let Runner = TickStream.Runner;//执行对象，用于执行方法
    let Feedback = TickStream.Feedback;//反馈对象，用于各个对象之间的沟通和所有数据的反馈

    //展示资源视图
    GUI.show();

    /**
     * TickStream核心基本运行过程
     * 1.Feedback会向WeightSystem索取下一个Tick的方案
     * 2.WeightSystem分析Memory并结合算法返回方案
     * 3.LinkedQueue分析方案并处理队列链表
     * 4.Runner执行LinkedQueue提交的队列链表
     * 5.FeedBack会持续监控Runner执行状态
     * 6.LinkedQueue全部出队完成或执行时间超出本Tick中方案允许的时间，Runner执行结束
     * 7.LinkedQueue向Feedback提交本Tick的队列链表情况
     * 8.Feedback汇总本Tick情况选择保存到Memory
     * 9.本Tick结束
     */

    /**
     * Feedback通过Feedback向WeightSystem发送'nextTick'信息
     * 以此获得本Tick的执行方案reply
     * 该reply对象包含两个数据
     * reply.queue [LinkedQueue.creat()]:下一个tick的队列链表
     * reply.runTimeLimit [number]:下一个tick的最大运行时间(cpu上限)
     */
    let reply = Feedback.send(WeightSystem, 'nextTick');

    /**
     * 通过LinkedQueue对象new出一个funLinkedQueue用于处理本tick的队列链表
     * LinkedQueue.pushLink将replay.queue整合到funLinkedQueue
     * @note 这里其实可以直接使用reply.queue给下一步的Runner跑，增加此环节是为了方便二次开发
     */
    let funLinkedQueue = new LinkedQueue.creat();
    LinkedQueue.pushLink(funLinkedQueue, reply.queue);

    //记录TickStream耗时的结束点
    let timeEndForTS = Game.cpu.getUsed();
    Feedback.tickConsuming((timeEndForTS - timeStartForTS).toFixed(2));

    /**
     * 将funLinkedQueue递交至Runner
     * Runner会以此跑完funLinkedQueue中的方法
     * 并结合reply.runTimeLimit决定何时结束
     */
    let allFunSize = funLinkedQueue.getLength();
    while (funLinkedQueue.getLength() > 0) {

        /**
         * Runner会执行目标方法并将结果返回给result
         * Feedback.read()读取返回的信息分析并储存到Memory
         * Feedback会将此类信息储存在Memory-TickStream-Register-FunList下
         * Feedback读取不同类型的数据会储存在不同的地方
         * 关于Feedback做了什么或者你想二次开发，请查看文档
         */
        let result = Runner.run(funLinkedQueue.pop());
        Feedback.read(result);

        /**
         * 如果总时间超过本次的runTimeLimit上限，将会结束
         * 如果funLinkedQueue出队全部完成，将会结束
         * 如果即将执行的方法，时间会超过允许的限度（可自定义），将会结束
         * 根据策略和历史数据，WeightSystem一般会给出运行时间总是接近runTimeLimit的队列确保所有方法能够科学运行
         */
        if (Game.cpu.getUsed() > reply.runTimeLimit) { break; }
    }

    //本Tick结束
    Feedback.tickEnd(funLinkedQueue);

    //发送本Tick信息到Feedback处理并记录到Memory
    Feedback.read({
        type: 'tickRunningResult',
        data: {
            cpu: Game.cpu.getUsed(),
            allFunSize: allFunSize,
            unexecutedFunSize: funLinkedQueue.getLength()
        }
    });
    //console.log("未执行数量"+funLinkedQueue.getLength()+"   当前使用cpu:"+Game.cpu.getUsed());


    //将TickStream对象返回，这里先返回0,后期功能扩展可以返回TickStream对象
    return 0;
}

