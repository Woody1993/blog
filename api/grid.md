# Grid 数据表格

> Grid 2.0版本在布局结构、调用方式、操作逻辑等方面进行了很大的改变。首先重构了整个表格HTML代码结构，让表头、表体、汇总行，以及固定列和主表的滚动联动更加高效。其次省略了new操作符，使得调用起来更加方便。最大的改变是完全颠覆的行操作方式。

## 开始使用

我们首先需要引入数据表格模块，并使用改该模块提供的构造函数去创建表格对象：

```
require('grid', function(grid) {
    var tb = grid();

    // tb即创建的表格对象
});
```

构造函数的参数为可选，具体可参考[基础配置](#gridOptions)。

<a id="gridOptions" />

## 基础配置 

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
box | String \| Object | body | 表格的容器对象<br>可以传入jQuery选择器、jQuery对象或dom对象
dataFrom | Object | - | 详见[数据源配置](#dataFormOptions)
width | Number \| String \| Function | 100% | 表格的宽度<br>支持百分比、像素值或者通过方法动态设置
height | Number \| String \| Function | auto | 表格的高度<br>支持auto（根据内容计算）、像素值或者通过方法动态设置
event | Object | - | 详见[数据行事件绑定](#rowEvent)
check | Object | - | 详见[数据行选中规则](#rowCheck)
colModel | Array | - | 详见[数据列配置](#colModel)

<a id="dataFormOptions" />

## 数据源配置

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
type | String | async | 数据来源方式<br>**async**：通过异步请求获取<br>**local**：直接传入数据
url | String | - | 异步请求接口地址
method | String | GET | 异步请求方式，GET或POST
dataType | String | json | 接口返回的数据类型，同$.ajax
pageSize | Number | 20 | 异步请求每页数据的条数
data | Object \| Array | - | type为async时表示提交给接口得参数<br>type为local时表示表格数据
dataFormatter | Function | - | 返回值作为表格行数据，默认为接口返回数据的data字段
countDataFormatter | Function | - | 返回值作为表格汇总数据，默认为接口返回数据的count字段
TotalDataFormatter | Function | - | 返回值作为表格总条数数据，默认为接口返回数据的total字段

<a id="rowEvent" />

## 数据行事件绑定

事件 | 说明
--- | -----
click | 行点击时触发，接收参数为该行的数据
beforeSelect | 行选中前触发，接收参数为该行的数据，返回false可阻止该行被选中
select | 行选中时触发，接收参数为该行的数据

<a id="rowCheck" />

## 数据行选中规则

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
multiple | Boolean | false | 是否支持多选
checkAll | Boolean | false | 是否有全选按钮
callType | Number | 0 | 触发选中的方式<br>**1**：通过点击复选框<br>**2**：通过点击行<br>**0**：以上两种都支持

<a id="colModel" />

## 数据列配置

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
title | String | - | 表头名称
subCol | Array | - | 配置下级列，以多级表头的方式展示。该配置生效时以下配置将无效<br>具体配置同[数据列配置](#colModel)
sys | String | - | 调用系统列，目前仅支持index（序号列）
name | String | - | 字段名称
width | Number | 100 | 列宽，仅支持像素值
forzen | String | - | 固定列类型<br>**left**：左边固定<br>**right**：右边固定
align | String | left | 文字对齐方式<br>**left**：左对齐<br>**center**：居中<br>**right**：右对齐
overflow | Boolean | true | 超出的文字是否省略，false则会换行
editable | Object \| Boolean | false | 详见[单元格文本框配置](#colInput)
dataFormatter | Function | - | 接收参数为当前单元格的数据，返回值将被展示在该单元格中
titleFormatter | Function \| Boolean | true | 接收参数为当前单元格的数据，返回值将作为鼠标停留在该单元格上时的提示信息<br>false则无提示
count | Object \| Boolean | false | 详见[数据列汇总配置](#colCount)
sort | Object \| Boolean | false | 详见[数据列排序配置](#colSort)