# Grid 数据表格

> Grid 2.0版本在布局结构、调用方式、操作逻辑等方面进行了很大的改变。首先重构了整个表格HTML代码结构，让表头、表体、汇总行，以及固定列和主表的滚动联动更加高效。其次省略了new操作符，使得调用起来更加方便。最大的改变是完全颠覆的行操作方式。

## 开始使用

首先需要引入数据表格模块，并使用该模块提供的构造函数去创建表格对象：

```
require('datagrid', function(datagrid) {
    var grid = datagrid([options]);

    // grid即创建的表格对象
});
```

options为表格配置项，具体可参考[基础配置](#gridOptions)。

<a id="gridOptions" />

## 基础配置 

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
box | String \| Object | body | 表格的容器对象<br>可以传入jQuery选择器、jQuery对象或dom对象
dataFrom | Object | - | 详见[数据源配置](#dataFormOptions)
width | Number \| String \| Function | 100% | 表格的宽度<br>支持百分比、像素值或者通过方法动态设置
height | Number \| String \| Function | 父元素高度 | 表格的高度<br>支持auto（根据内容计算）、像素值或者通过方法动态设置
event | Object | - | 详见[数据行事件绑定](#rowEvent)
check | Object | - | 详见[数据行选中规则](#rowCheck)
colModel | Array | - | 详见[数据列配置](#colModel)
shortcuts | Array | - | 启用的表格快捷键

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
collectFormatter | Function | - | 返回值作为表格汇总数据，默认为接口返回数据的count字段
totalFormatter | Function | - | 返回值作为表格总条数数据，默认为接口返回数据的total字段
idKey | String | - | 申明数据唯一标识的Key值，用于已选数据的记录和回填

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

<a id="colInput" />

## 单元格文本框配置

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
className | String | - | 文本框class名
click | Function | - | 文本框click事件
focus | Function | - | 文本框focus事件
blur | Function | - | 文本框blur事件
change | Function | - | 文本框change事件

<a id="colCount" />

## 数据列汇总配置

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
mode | String | number | 汇总方式<br>**number**：以数字求和方式汇总<br>**type**：以内容出现次数汇总
itemFormatter | Function | - | 单行数据处理，返回值进行汇总
totalFormatter | Function | - | 汇总数据处理，返回值展示在汇总行。如果以数组返回，则数组每项展示一行

<a id="colSort" />

## 数据列排序配置

配置项 | 类型 | 默认值 | 说明
----- | ---- | ------| ----
type | String | desc,asc | 依次点击的排序方式<br>**desc,asc**：先倒序再顺序<br>**asc,desc**：先顺序再倒序<br>**desc**：只倒序<br>**asc**：只顺序
param | String | - | 传递给接口的参数名，默认为列的name值

## 表格对象方法

表格对象提供了如下方法，以便于对表格及数据进行操作。

方法名 | 参数 | 返回值 | 说明
----- | ---- | ------| ----
update | page | 表格对象 | 刷新指定页码数据<br>**page**：页码值，不传则刷新当前页
resize | - | 表格对象 | 重置表格宽高
pushRows | data | 表格对象 | 向表格最下面插入数据行<br>**data**：待插入数据，格式为json数组。例如：[{},{}]
unshiftRows | data | 表格对象 | 向表格最上面插入数据行<br>**data**：待插入数据，同上
insertRows | index, data | 表格对象 | 向表格指定位置插入数据行<br>**index**：目标位置索引值，从0开始<br>**data**：待插入数据，同上
getRows | index | 数据行对象 | 获取当前页指定索引值的行<br>**index**：目标索引值，从0开始，获取多行可传数组。例如：[0,1,2]
getAllRows | - | 数据行对象 | 获取当前页所有行
getCrtRows | - | 数据行对象 | 获取当前页所有选中行
getRowsBy | config | 数据行对象 | 获取当前页所有满足条件的行<br>**config**：获取行的条件。例如：{name: ['test1', 'test2'], type: '1'}表示获取name为test1或test2，并且type等于1的行
getCrtData | - | 行数据 | 获取所有已选数据（包括非当前页）
clearCrtData | - | 表格对象 | 清除所有已选数据
setWidth | width | 表格对象 | 修改表格宽度<br>**width**：表格宽度，支持像素值、百分比或方法
setHeight | height | 表格对象 | 修改表格高度<br>**height**：表格高度，支持像素值或方法

## 数据行对象方法

通过表格对象方法获取数据行对象后，可以通过以下方法去操作数据行对象。

方法名 | 参数 | 返回值 | 说明
----- | ---- | ------| ----
moveTo | index | 数据行对象 | 将数据行移动至指定位置<br>**index**：目标索引值，从0开始
remove | - | 数据行对象 | 删除数据行
getIndex | - | 索引值 | 获取数据行索引值，多行则以数组方式返回
getData | - | 行数据 | 获取数据行索数据，多行则以数组方式返回
select | - | 数据行对象 | 选中数据行
unselect | - | 数据行对象 | 取消选中数据行
isSelected | - | boolean | 判断行是否选中，多行时全部选中才为true
update | data | 数据行对象 | 刷新数据行的数据<br>**data**：多行则传入json数据，并与数据行一一对应进行刷新
show | - | 数据行对象 | 显示数据行
hide | - | 数据行对象 | 隐藏数据行
each | function | 数据行对象 | 遍历数据行<br>**function**：遍历方法，接收两个参数，单个行对象已经序号值
eq | number | 数据行对象 | 获取指定序号的行对象
find | selector | jquery对象 | 通过选择器获取行内元素