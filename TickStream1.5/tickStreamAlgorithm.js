/*
文件名：tickStreamAlgorithm.js
描述：tickStream的算法文件
author:MingZeY(1552904342@qq.com)
创建日期：2020/3/2
*/


/**
 * 您可以在这里完成对TickStream算法的全自定义设计
 * 当然你也可以使用其他玩家编写的算法文件
 * 您也可以从GitHub上获取持续更新或由其他玩家更新的算法文件
 * 这取决于你个人的偏好
 * 算法决定了tickStream将按如何顺序、多长时间去执行玩家的方法
 * 如果您对您的算法功底很有自信，您一定可以写出耗时更短，功能更强大的算法系统
 */


/**
 * 下面交给你了，使用入参数据提供的信息写出虎躯一震的算法吧
 * 入参数据
 * @param funList 方法列表数组
 *      @syntax funList[i] 储存在Memory中相对应的方法对象
 *      @syntax funList[i].funName 用户在main中自定义的描述或名称
 *      @synyax funList[i].options 对象中包含了用户在main中自定义的参数
 * 
 * @param nextQueue 下一个tick的队列链表
 *      @function nextQueue.push(ele) 入队，向末尾加入
 *      @function nextQueue.pop() 出队，从头部取出
 *      @function nextQueue.pushHead(ele) 入队，向头部加入
 * 
 * @param Algorithm 当中包含了一些实用的方法以减少开发难度
 *      @function Algorithm.get.averageCPUByName(name) 通过方法名获取这个方法的平均消耗cpu
 *      @function Algorithm.get.averageCPUByObj(Obj) 通过TickStream允许的方法对象获取这个方法的平均消耗cpu
 *      @function Algorithm.get.maxCPUByName(name) 获取某个方法的最大cpu 
 *      @function Algorithm.get.maxCPUByObj(Obj)
 *      @function Algorithm.get.minCPUByName(name) 获取最小cpu 
 *      @function Algorithm.get.minCPUByObj(Obj) 
 *      @function Algorithm.get.lastTimeLinkedQueue() 获取上一次的队列链表 ！该方法当前不可用
 *      @function Algorithm.get.latelyLinkedQueue(num) 获取最近指定(小于50)Tick的队列链表，将返回一个数组 ！该方法当前不可用
 *      @function Algorithm.get.freeBucket();//获取可用Bucket数量
 *      @function Algorithm.get.freeBucketRate();//获取可用Bucket的百分比0-100
 * 
 *      @syntax Algorithm.environment.isAttack 是否处于攻击状态,需要您在其他的方法中调用TickStrea的方法来改变这个状态 ！该方法当前不可用
 *      @syntax Algorithm.environment.isDefense 是否处于防守状态 ！该方法当前不可用
 *      @stntax Algorithm.environment.custom 玩家自定义的环境信息 ！该方法当前不可用
 * 
 * @param MemorySpace 指向Memory.TickStream.Algorithm
 * 
 * @param isRefresh 布尔值，代表global本tick是否被刷新，一般在用户保存代码后立刻触发，可以判断用户是否修改了注册表
 * 
 * @param LinkedQueue 队列链表
 *      @syntax new LinkedQueue.creat() 创建一个队列链表
 *      @function .push(ele) 向尾部添加元素
 *      @function .pushHead(ele) 向头部添加元素
 *      @function .pop() 头部出队
 *      @function .getLength() 获取长度
 *      @function .clear() 清空
 *      @function .getFront() 获取头部
 *      @function .getRear() 获取尾部
 *      @function .pushLink(src,addLink) 将addLink的头部与src的尾部相连
 */
module.exports = function (funList, nextQueue, Algorithm,MemorySpace,isRefresh,LinkedQueue,tickLimiti) {

   //建立runTimeLimiti简单线性模型
   let getRunTimeLimiti = function(freeBucketRate){
      return 0.25*freeBucketRate-6;
   }

   let reBuildRoulette = function(){
      //先获取所有的Link Round方法，并创建Roulette
      MemorySpace.Roulette = {
         FunIdArr:[],
         LastId:-1,
      }

      for(let i=0,len = funList.length;i<len;i++){
         let fun = funList[i];
         let funIdArr = MemorySpace.Roulette.FunIdArr;
         //console.log(funList[i].funName +" is "+funList[i].options.type);
         
         //获取所有的LinkRound类方法
         if(fun.options.type == 'Link Round'){
            funIdArr.push(i);
         }
      }

      //设置LastId为第一个
      MemorySpace.Roulette.LastId = 0;
   }

   if(funList == null){
      return tickLimiti;
   }


   //判断Link Round方法轮盘是否存在
   if(typeof(MemorySpace.Roulette) == 'undefined'){
      //如果不存在则布置轮盘
      reBuildRoulette();
   }

   //判断是否需要刷新Link Round方法轮盘
   if(isRefresh){
      //重载
      reBuildRoulette();
      return tickLimiti;//返回一个空tick
   }

   //载入方法到nextQueue并计算时间
     //计算本Tick可用量，以及缓存
   let thisTickCPU = getRunTimeLimiti(Algorithm.get.freeBucketRate());
   let tempTickCPU = 0;
   let floatingValue = 2;

   //先载入Every Time方法
   let ETQue = new LinkedQueue.creat();
   for(let i=0,len = funList.length;i<len;i++){
      if(funList[i].options.type == 'Every Time'){
         ETQue.push(funList[i]);
         //叠加时间
         let averageCPU =  Algorithm.get.averageCPUByObj(funList[i]);

         if(averageCPU == -1){
            LinkedQueue.pushLink(nextQueue,ETQue);
            return tickLimiti;
         }else{
            tempTickCPU += Algorithm.get.averageCPUByObj(funList[i]);
         }
      }
   }

   //检查有无超过
   if(tempTickCPU > 20){
      console.log("警告：所有Every Time 类的方法负载总和可能已经超出单个Tick内的极限，TickStream已经到达平衡极限");
      console.log("请减少代码的复杂度，或将某个Every Time类方法改成Link Round类以缓解当前CPU负载");
      console.log("如果没有持续触发该警告也有可能是您的某个Every Time方法在上个Tick中的耗时太长，请注意优化您的代码逻辑");
      console.log("At Game Time: "+Game.time);

      return tickLimiti;//资源全放
   }
   
   //拉取轮盘，并载入Link Round方法

   if(MemorySpace.Roulette.FunIdArr.length == 0){
      LinkedQueue.pushLink(nextQueue,ETQue);
      return tickLimiti;
   }
   let Roulette = MemorySpace.Roulette;
   let FunIdArr = Roulette.FunIdArr;
   let LRQue = new LinkedQueue.creat();

   //拉取本Tick方法开始定位点即获取上一个tick最后执行的方法的轮盘的id的键值+1
   let StartKey = Roulette.LastId;
   
   while(tempTickCPU + floatingValue < thisTickCPU
      || tempTickCPU - floatingValue < thisTickCPU){

      //检查键值是否合法
      if(StartKey > Roulette.FunIdArr.length-1){
         StartKey = 0;
      }

      //获取到Key对应的Funlist键值对应的方法
      let fun = funList[FunIdArr[StartKey]];

      let averageCPU = Algorithm.get.averageCPUByObj(fun);

      
      LRQue.push(fun);//进入队列链表头部

      if(averageCPU == -1){//如果是新方法，获取返回-1，那么先丢出去执行一次，结束算法
         //合并队列
         LinkedQueue.pushLink(LRQue,ETQue);
         LinkedQueue.pushLink(nextQueue,LRQue);
         return tickLimiti;
      }else{
         tempTickCPU += averageCPU;
      }

      // if(LRQue.getLength()>100){//队列长度限制，防止死循环
      //    //合并队列
      //    LinkedQueue.pushLink(LRQue,ETQue);
      //    LinkedQueue.pushLink(nextQueue,LRQue);
      //    return 500;
      // }

      StartKey++;
   }
   Roulette.LastId = StartKey;

   //合并队列
   LinkedQueue.pushLink(LRQue,ETQue);
   LinkedQueue.pushLink(nextQueue,LRQue);


   /**
    * 因为本算法采用的均值计算预测运行时间，并且EveryTime类方法总是最后执行
    * 因此返回tickLimiti，但TickStream并不会因此就运行tickLimiti这么长的时间
    * 详情可以查看tickStreamMountExtension中配合Runner管控CPU的运行规则
    */ 
   return tickLimiti;
}