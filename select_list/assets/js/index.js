(function(w, $, d) {
	index = {
		ready: function() {
			index.listener();
		},

		listener: function() {
			var data = [{
				id: 1,
				pid: 0,
				name: '二级1'
			}, {
				id: 2,
				pid: 0,
				name: '二级2'
			}, {
				id: 3,
				pid: 0,
				name: '二级3'
			}, {
				id: 4,
				pid: 1,
				name: '三级1'
			}, {
				id: 5,
				pid: 1,
				name: '三级2'
			}, {
				id: 6,
				pid: 2,
				name: '三级3'
			}, {
				id: 0,
				name: '一级1'
			}, {
				id: 7,
				pid: 6,
				name: '四级1',
				data: 3
			}, {
				id: 8,
				pid: 4,
				name: '四级2'
			}, {
				id: 8,
				pid: 5,
				name: '四级3'
			}, {
				id: 10,
				name: '一级2'
			}, {
				id: 11,
				pid: 10,
				name: '二级4'
			}, {
				id: 12,
				pid: 11,
				name: '三级4'
			}]

			$sel = new dSelect({
				box: '#select',
				width: '200', // 宽
				height: 30, // 高
				listHeight: 200, // 下拉框列表最大高度
				deOption: true, // 是否有默认项
				deOptName: '请选择', // 默认项的内容
				deOptVal: '', // 默认项的值
				title: '姓名',
				selOptVal: null, // 默认选中项的值
				name: '', // 用于表单提交时候的参数名
				multiple: false, // 是否支持多选
				checkAll: true, // 是否有全选项
				options: data, // 下拉列表数据
				disabled: false, // 是否禁用
				selectable: 1, // 多级时可选择的项，1（全部可选）| 2（分支最底级）
				search: function(keyword) { // 是否支持搜索
					alert(keyword)
				},
				callback: function(id, name, data) { // 选择时的回调函数
					console.log(id, name, data)
				}
			});
		}
	}

	$(index.ready);
})(window, jQuery, document);