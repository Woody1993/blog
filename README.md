
# dToolkit
基于模块化加载方案的后台管理系统工具包

## 文件目录
```
├ data  // 模拟json数据文件
├ demo  // 各模块组件预览页面
├ font  // 字体图标文件
├ script  // 各模块组件
├ style  // 样式文件
├ d.toolkit.js  // 基础核心代码
└ index.html  // 预览主页面
```

## 开始使用
将工具包完整的部署到你的项目目录或静态资源服务器当中，只需要在页面中引入基础核心代码文件：
```
<script src="d.toolkit.js"></script>
```
没错，不需要去引入其它文件，因为它们都是在实际使用时才会自动加载。比如：
```
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>dToolkit</title>
</head>
<body>

    <!-- HTML代码 -->

    <script src="d.toolkit.js"></script>
    <script>
        require(['jquery', 'grid'], function($, grid) {
        
            // 业务逻辑代码
            
        });
    </script>
</body>
</html>
```
**不要改变工具包的目录关系，负责会导致各组件载入失败**。如果一定需要修改目录，可以在**d.toolkit.js**文件中找到如下代码，并修改其它文件的相对路径地址。或直接使用相对路径去加载组件。
```
var paths = {
    reset: "css!style/reset",
    jquery: "script/toolkit.jquery",
    grid: "script/toolkit.grid",
    grid_css: "css!style/toolkit.grid",
    tools: "script/toolkit.tools"
};
```

## 加载模块
我们需要使用require方法去加载所需要的模块，并在回调方法中去使用。通常来说，回调方法的参数和加载文件当中的模块一一对应。但如果加载文件不是js文件或其中没有定义模块，则不会出现与之对应的参数：
```
require([
    'jquery',  // 通过预先定义好的模块名称加载
    'script/toolkit.tools.js'  // 通过模块文件的相对路径加载，可以省略.js后缀
], function($, tools) {

    // 在这里就可以使用jquery对象和tools对象当中的方法了

});
```
有可能你只使用了一个模块，可以简化成以下写法：
```
require('jquery', function($) {

    // 在这里就可以使用jquery对象当中的方法了

});
```
或者不需要使用任何组件却依然想使用require方法（虽然和不使用没什么区别）：
```
require(function() {

    // 业务逻辑代码

});
```

## 定义模块
d.toolkit.js除了为我们提供require方法外，还提供了自定义模块的方法define。你需要新建一个文件（比如module.js），并写入如下代码：
```
define(function() {

    // 模块逻辑代码

    return [Object Object];  // 在这里暴露该模块的操作对象
});
```
如果你的自定义模块需要依赖其他模块，可以使用如下写法加载其他模块：
```
define([
    'jquery'
], function($) {

});
```
或者简化一下：
```
define('jquery', function($) {

});
```
然后就可以在需要使用的地方加载该模块了：
```
require('module', function(obj) {

    // 在这里就可以使用你的自定义模块了

});
```

## 加载样式文件
我们可以通过使用css!前缀加载所依赖样式文件：
```
require([
  'css!style/reset.css'  // 这里同样可以省略.css后缀
], function($) {

    // 在这里就可以使用jquery对象当中的方法了

});
```
