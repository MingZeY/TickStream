## 最近我们做了什么
### 2020/3/9 `Verison 1.5`
我们为TickStream内置了一个简单的算法，他可以满足TickStream框架的基本应用

## 待优化的问题
* 更友好的数据显示界面
* 功能更加专一的算法，这会衍生很多不同的风格
* 提供编程引导文档

## 已知问题
* 算法对CPU的计算不够精确，我们还在平衡算法效率和代码质量
* 部署TickStream后，如果玩家在TickStream环境之外存在其他大量的代码，将导致算法的计算结果失真，甚至导致崩溃

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
到main.js在require之前获取到方法对象，它看起来是这个样子
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

** 注意，注册表入参结构是 **
require("...")([{方法表},{方法表},{...}])


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
* `角色移动方法` 与 `任务驱动类方法` 将会在每Tick执行一次
* `角色驱动类方法` 会按顺序铺满剩下可用的CPU


## 注意事项
* 使用TickStream可能会让您的Bucket稳定在85~95%之间，同时CPU也会涨到20左右，不必担心，这就是TickStream充分利用CPU的结果
* 如果您发现您的CPU没有维持到20左右，有可能的原因是因为您没有注册 `Link Round` 类型的方法，因此TickStream没有为您铺满这个Tick而只运行了 `Every Time`类的方法
* 在部署TickStream前，请尽量保证TickStream环境之外不要有过多占用CPU的代码
