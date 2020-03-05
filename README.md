## 什么是TickStream
### 概述
TickStream 是 Screeps（一款编程游戏）的一种代码框架，使用TickStream可以充分发挥玩家在这款游戏中对其一些重要资源的应用能力。如果您不知道这款游戏，请通过链接前往官网或者社区论坛了解该游戏或暂停阅读，因为下面的内容将对你毫无意义。

### 详细概述
在Screeps中，由于服务器的架构的原因，玩家的代码在云端的执行时间将会存在阈值。这个阈值被官方称作 `CPU上限`，因此 `CPU`就成为了大部分玩家发挥代码能力的阻力之一。如果玩家的代码过于陈杂或过于庞大，就会导致CPU很快接近阈值且无法再新加任何代码。带来了不良好的游戏体验。

TickStream就是为了解决这样的问题，但从本质上TickStream并未通过任何手段和途径提高您原有的CPU，而是通过“压榨”CPU的可用资源以及合理利用游戏机制来达到提高代码运行效率。

在Screeps游戏官方服务器SHARD3中，玩家的CPU上限为20，同时每个玩家拥有10,000的`Bucket`空间用于存储多余的CPU。在每个Tick里，玩家的CPU若是没有超过阈值20，那么多余的CPU将会存入Bucket，这个是大部分玩家乃至新手玩家也知道的事情。但若Bucket的储存已经达到了100%，多余的CPU将会消失，因此当你有CPU未使用时，TickStream将会有逻辑性的提前把下一个Tick的任务拿到当前Tick来执行，反之，当你的代码本Tick或多个Tick内都超负载无法全部执行完成的时候，TickStream将会有逻辑性的把本Tick的任务延后到下一个Tick执行。

同时为了更好的容错玩家的习惯，我们也在TickStream中加入了许多新概念，诸如`权重优先`,`计划停摆`,`自定义算法`,`计划任务`,`触发任务`等（部分内容在开发计划或是在测试中）。

目前基于TickStream思想的出现，这也将会改变我们对Screeps的理解，使用TickStream框架思维来编写您的代码，将有无穷的潜力。等待时机足够成熟，我们将开启专用的服务器和网站供玩家分享他们自己的针对TickStream的算法以及心得，同时我们也将分享使用TickStream开始编程的教程以及TickStream的二次开发文档。

这就是TickStream，从现在开始我们也将持续更新TickStream的内容以及优化它的算法，让它功能更加齐全。

**注意：若您看到本行字，即代表当前版本不适合新玩家使用。也代表当前版本的TickStream并没有内置算法，这意味着您无法使用到完整功能，如果您有足够的能力，您可以借此开始编写自己的算法**

## 如何安装TickSteam
### 下载
通过本页您可以下载TickStream的文件组，这组文件中一定包含三个文件

* tickStream.js
* tickStreamMountExtension.js
* tickStreamAlgorithm.js

### 安装

一、将您下载的文件组放置在您的游戏代码根目录，即同main.js在一个目录

二、在main.js文档.loop下的 **末尾** 添加代码，它看起来像这样
```
module.exports.loop = function () {
    require('tickStreamMountExtension')();
}
```
若不出意外，您将会看到您的殖民地中心出现“TickStream已就绪”字样。

三、部署TickStream
前往控制台，在控制台键入代码
```
global.tickStream.deploy()
```
您将会看见控制台返回部署完成字样并显示当前版本
如果您想取消tickStream的部署，请键入global.tickStream.undeploy()

四、编写并获取方法对象
请新建一个JS文件或使用您之前的文件，这里我将写一段示例

新建一个fun1.js文档当中写入如下内容
```
//fun1.js

module.exports = function(){
    //您要执行的代码
    console.log("fun1执行完成");
}
```
然后回到main.js在require之前获取到方法对象，它看起来是这个样子
```
module.exports.loop = function () {

    //获取方法
    let fun1 = require('fun1');
    let fun2 = require('fun1');//其他的方法，这里演示因此继续使用fun1.js
    let fun3 = require('fun1');//其他的方法

    require('tickStreamMountExtension')();
}
```
确保您的代码完成后下面将进行注册表登记

五、注册表登记
这里的代码比较多，我这里先直接贴上来
```
module.exports.loop = function () {

    //获取方法
    let fun1 = require('fun1');
    let fun2 = require('fun1');//其他的方法，这里演示因此继续使用fun1.js
    let fun3 = require('fun1');//其他的方法

    //启动TickStream 并注册方法
    require('tickStreamMountExtension')(
    [
        {
            funName:"普通可叠加算法类执行方法1",
            funObj:fun1,
            options:{
                weightLevel:0,//权重级别，权重越高，在资源告急时先被满足
                type:'normal',
                /**
                * 类型：
                * 自动(auto)：根据权重自动调整
                * 旧的(old)：
                * 可叠加(superposition)：一个tick可执行多次
                * 不可叠加(nosuperposition):一个tick内不允许多次执行
                * 执行器方法(actuator)：
                * 一个tick内必须且执行一次，creep移动攻击等务必使用
                */
                state:'running'//状态：您可以选择停用(stop)或者启用(running)
            }
        },
        {
            funName:"角色驱动类方法",
            funObj:fun2,
            options:{
                weightLevel:10,
                type:'superposition'
            }
        },
        {
            funName:"任务驱动类方法",
            funObj:fun3,
            options:{
                weightLevel:10,
                type:'superposition'
            }
        }
    ]);//下文不建议出现任何代码


}
```

六、部署完成
至此您的TickStream就已经部署完成，您可能会感到疑惑：为什么没有任何反应，原因是TickStream的算法还没有提供任何服务，这需要您自己去根据TickStream的特性在tickStreamAlgorithm.js完成，相关API在其文件中以及注明，或者您也可以等待下一个可用版本的发布。


## 注意事项
暂无
