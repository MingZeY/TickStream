## 什么是TickStream
### 概述
TickStream 是 Screeps（一款编程游戏）的一种框架，使用TickStream可以充分发挥玩家在这款游戏中对其一些重要资源的应用能力。如果您不知道这款游戏，请通过链接前往官网或者社区论坛了解该游戏或暂停阅读，因为下面的内容将对你毫无意义。

### 详细概述
在Screeps中，由于服务器的架构和运营的原因，玩家的代码在云端的执行时间将会存在阈值。这个阈值被官方称作 `CPU上限`，因此 `CPU`就成为了大部分玩家发挥代码能力的阻力之一。如果玩家的代码过于陈杂或过于庞大，就会导致CPU很快接近阈值且无法再新加任何代码。带来了不良好的游戏体验。

TickStream就是为了解决这样的问题，但从本质上TickStream并未通过任何手段和途径提高您原有的CPU，而是通过“压榨”CPU的可用资源以及合理利用游戏机制来达到提高代码运行效率。

在Screeps游戏官方服务器SHARD3中，玩家的CPU上限为20，同时每个玩家拥有10,000的`Bucket`空间用于存储多余的CPU。在每个Tick里，玩家的CPU若是没有超过阈值20，那么多余的CPU将会存入Bucket，这个是大部分玩家乃至新手玩家也知道的事情。但若Bucket的储存已经达到了100%，多余的CPU将会消失，因此当你有CPU未使用时，TickStream将会有逻辑性的提前把下一个Tick的任务拿到当前Tick来执行，反之，当你的代码本Tick或多个Tick内都超负载无法全部执行完成的时候，TickStream将会有逻辑性的把本Tick的任务延后到下一个Tick执行。

同时为了更好的容错玩家的习惯，我们也在TickStream中加入了许多新概念，诸如`权重优先`,`计划停摆`,`自定义算法`,`计划任务`,`触发任务`等（部分内容在开发计划或是在测试中）。

目前基于TickStream思想的出现，这也将会改变我们对Screeps的理解，使用TickStream框架思维来编写您的代码，将有无穷的潜力。等待时机足够成熟，我们将开启专用的服务器和网站供玩家分享他们自己的针对TickStream的算法以及心得，同时我们也将分享使用TickStream开始编程的教程以及TickStream的二次开发文档。

这就是TickStream，从现在开始我们也将持续更新TickStream的内容以及优化它的算法，让它功能更加齐全。

## 最近我们做了什么
### 2020/3/9 `Verison 1.5`
我们为TickStream内置了一个简单的算法，他可以满足TickStream框架的基本应用

## 待优化的问题
### 更友好的数据显示界面
### 功能更加专一的算法，这会衍生很多不同的风格
### 提供编程引导文档

## 已知问题
### 算法对CPU的计算不够精确，我们还在平衡算法效率和代码质量
### 部署TickStream后，如果玩家在TickStream环境之外存在其他大量的代码，将导致算法的计算结果失真，甚至导致崩溃

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
    let fun2 = require('someSystem').someFunction;
    //或
    let fun3 = function(){
        //code
    }

    require('tickStreamMountExtension')();
}
```
确保您的代码完成后下面将进行注册表登记

五、注册表登记

目前type属性只支持 `Every Time` 和 `Link Round`
您也可以不填属性，这样默认代表type属性为 `Every Time`

这里的代码比较多，我这里先直接贴上来
```
module.exports.loop = function () {

    //获取方法
    let fun1 = require('fun1');
    let fun2 = require('someSystem').someFunction;
    //或
    let fun3 = function(){
        //code
    }

    //启动TickStream 并注册方法
    require('tickStreamMountExtension')([
        {
            funName:"角色移动方法",
            funObj:fun1,
            options:{
                type:"Every Time"//代表这个方法每Tick运行且只运行一次
            }
        },
        {
            funName:"角色驱动类方法",
            funObj:fun2,
            options:{
                tpye:"Link Round"//代表这个方法会和其他同类属性的方法按顺序执行且尽可能多次执行
            }
        },
        {
            funName:"任务驱动类方法",
            funObj:fun3,
            //不填options则默认其type为 Every Time
        }
    ]);//下文不建议出现任何代码


}
```

六、部署完成
至此您的TickStream就已经部署完成


## 注意事项
暂无，在部署TickStream前，请尽量保证TickStream环境之外不要有过多占用CPU的代码
