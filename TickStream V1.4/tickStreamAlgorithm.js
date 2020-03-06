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
 *      @function nextQueue.push(ele) 入队
 *      @function nextQueue.pop(ele) 出队
 * 
 * @param Algorithm 当中包含了一些实用的方法以减少开发难度
 *      @function Algorithm.get.averageCPUByName(name) 通过方法名获取这个方法的平均消耗cpu
 *      @function Algorithm.get.averageCPUByObj(Obj) 通过TickStream允许的方法对象获取这个方法的平均消耗cpu
 *      @function Algorithm.get.maxCPUByName(name) 获取某个方法的最大cpu 
 *      @function Algorithm.get.maxCPUByObj(Obj) ！该方法当前不可用
 *      @function Algorithm.get.minCPUByName(name) 获取最小cpu 
 *      @function Algorithm.get.minCPUByObj(Obj) 
 *      @function Algorithm.get.lastTimeLinkedQueue() 获取上一次的队列链表 ！该方法当前不可用
 *      @function Algorithm.get.latelyLinkedQueue(num) 获取最近指定(小于50)Tick的队列链表，将返回一个数组 ！该方法当前不可用
 * 
 *      @syntax Algorithm.environment.isAttack 是否处于攻击状态,需要您在其他的方法中调用TickStrea的方法来改变这个状态 ！该方法当前不可用
 *      @syntax Algorithm.environment.isDefense 是否处于防守状态 ！该方法当前不可用
 *      @stntax Algorithm.environment.custom 玩家自定义的环境信息 ！该方法当前不可用
 */
module.exports = function (funList, nextQueue, Algorithm) {
   /**
    * 除TickStream的代码外
    * 这里是本Tick的开始(如果您按要求做到TickStream不前置任何代码的情况下)，
    * 并且这里的代码每Tick执行一次
    */

   //写下您的代码 下面将有一些使用API的示例

   /**
    * 如果funList未定义则直接跳出
    */
   if(typeof(funList) == 'undefined'){
      return 20;//返回最大cpu
   }

   /**
    * 获取所有方法的名称并通过名称查询它们的平均CPU
    */
   for (i in funList) {
      let name = funList[i].funName;
      let cpu = Algorithm.get.averageCPUByName(name);
      //console.log(name+"方法的平均CPU消耗为"+cpu);
   }
   /**
   * 获取所有方法的名称并通过对象查询它们的平均CPU
   */
   for (i in funList) {
      let cpu = Algorithm.get.averageCPUByObj(funList[i]);
      //console.log(funList[i].funName+"方法的平均CPU消耗为"+cpu);
   }

   for (var i = 0, len = funList.length; i < len; i++) {
      nextQueue.push(funList[i]);
   }

   /**
    * 返回runTimeLimit ，这个数值决定了本Tick的最大运行时间，您应该合理的控制这个数值，
    * bucket充足的情况下，您应该接近20
    * bucket不足的情况下，您应该尽量压低
    * 战斗时，您可以设置更充足的runTimeLimit
    * 战斗过后，请务必及时满足bucket降低runTimeLimit
    * 
    * 如果您设置的太低，而您给出的队列却无法全部执行
    * 这些方法将被搁置，您可以通过GET获取他们然后选择下一个Tick执行他们
    */
   return 15;
}