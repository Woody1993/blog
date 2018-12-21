$(function() {
	grid = dGrid({
		box: '#box',
		url: 'json/data.json',
		dataType: 'text',
		dataFormatter: function(data) {
			return data.data;
		},
		countDataFormatter: function(data) {
			return data.count;
		},
		rowsCountFormatter: function(data) {
			return data.total;
		},

		width: '100%',
		height: function() {
			return window.gridHeight || '600'
		},
		rowOnClick: function(obj, data, e) {
			//console.log(data);
		},
		rowOnSelect: function(data) {
			console.log(data);
		},

		selectModel: 1,
		callSelectModel: 2,
		selectAll: true,
		colModel: [
			{
				title: '序号',
				sys: 'index',
				frozen: 'left',
				width: 50,
				align: 'center',
				dataFormatter: function(index) {
					return '#'+index;
				},
				count: true,
				countFormatter: function(value, count) {
					return '本页合计<br />总合计';
				}
			}, {
				title: '状态',
				frozen: 'left',
				name: 'status',
				width: 50,
				sortBy: 'both', //none || asc || desc || both
				sortFrom: 'local', //ajax || local
				sortModel: 'string' //number || string
			}, {
				title: '订单号',
				frozen: 'left',
				name: 'orderNum',
				width: 90,
				dataFormatter: function(value, row) {
					return value;
				},
				titleFormatter: false
			}, {
				title: '买家信息',
				subCol: [
					{
						title: '头像',
						name: 'icon',
						width: 60,
						dataFormatter: function(value) {
							return '<div style="width:70px;height:70px;padding:5px 0;"><img style="max-width:100%;max-height:100%;" src="'+value+'" /></div>';
						}
					}, {
						title: '用户名',
						name: 'username',
						width: 60
					}, {
						title: '姓名',
						name: 'name',
						width: 60
					}, {
						title: '电话',
						name: 'phone',
						width: 80
					}
				]
			}, {
				title: '配送信息',
				subCol: [
					{
						title: '省份',
						name: 'province',
						width: 60
					}, {
						title: '城市',
						name: 'city',
						width: 60
					}, {
						title: '区县',
						name: 'county',
						width: 60
					}, {
						title: '详细地址',
						name: 'address'
					}
				]
			}, {
				title: '下单时间',
				name: 'buyDate',
				width: 120
			}, {
				title: '付款时间',
				name: 'payDate',
				width: 60
			}, {
				title: '货品数量',
				name: 'productCount',
				width: 60
			}, {
				title: '订单金额',
				subCol: [
					{
						title: '货品金额',
						name: 'productSum',
						width: 60,
						dataFormatter: function(value) {
							return value.toFixed(2);
						}
					}, {
						title: '运费',
						name: 'logisticsSum',
						width: 60,
						dataFormatter: function(value) {
							return value.toFixed(2);
						}
					}
				]
			}, {
				title: '支付方式',
				name: 'payType',
				width: 60
			}, {
				title: '支付金额',
				name: 'paySum',
				width: 60,
				dataFormatter: function(value) {
					return value.toFixed(2);
				}
			}, {
				title: '备注',
				name: 'remark',
				editable: true,
				editEvent: {
					click: function() {
						console.log('click');
					},
					focus: function() {
						console.log('focus')
					},
					blur: function() {
						console.log('blur');
					},
					change: function() {
						console.log('change');
					}
				},
				iptClassName: 'j-test j-test2'
			}, {
				title: '操作',
				frozen: 'right',
				width: 160,
				dataFormatter: function(value, row) {
					return [
						'<button class="top">置顶</button>',
						'<button class="prev">上移</button>',
						'<button class="next">下移</button>',
						'<button class="bottom">置底</button>'
					].join('');
				}
			}
		]
	});

	$(window).resize(function() {
		grid.resize();
	});

	$('#insert').click(function() {
		var count = $('#insertCount').val();
		var arr = [];
		for (var i=0; i<count; i++) {
			arr.push({
				status: '待付款',
				orderNum: '201701010001',
				username: 'admin',
				icon: 'http://placehold.it/100x100/666/fff.png',
				name: '张三',
				phone: '15012345678',
				province: '浙江省',
				city: '杭州市',
				county: '江干区',
				address: '凯旋路445号',
				buyDate: '2017-01-01 10:00:00',
				payDate: '2017-01-01 10:00:00',
				productCount: 10,
				productSum: 100,
				logisticsSum: 10,
				paySum: 110,
				payType: '支付宝',
				remark: '1'
			});
		}

		grid.insertRows((parseInt($('#insertIndex').val()) || 0), arr);
	});

	$('#delete').click(function() {
		var val = $('#deleteIndex').val();
		if (val != 'all') {
			val = val.split(',');
		}
		grid.deleteRows(val);
	});

	$('#move').click(function() {
		grid.moveRowTo((parseInt($('#moveIndex1').val()) || 0), (parseInt($('#moveIndex2').val()) || 0));
	});

	$('#onSelect').click(function() {
		var val = $('#onSelectIndex').val();
		if (val.indexOf(',') > -1) {
			val = val.split(',');
		}
		grid.selectRows(val);
	});

	$('#offSelect').click(function() {
		var val = $('#offSelectIndex').val();
		if (val != 'all') {
			val = val.split(',');
		}
		grid.unselectRows(val);
	});

	$('#getRowsIndex').click(function() {
		console.log(grid.getCrtRowsIndex());
	});

	$('#getRowsData').click(function() {
		console.log(grid.getCrtRowsData());
	});

	$('#getData').click(function() {
		console.log(grid.getData());
	});

	$('#box tbody tr').on('click', '.top', function(e) {
		var index = parseInt($(this).closest('tr').attr('index'));
		grid.moveRowTo(index, 0);
		e.stopPropagation();
	}).on('click', '.prev', function(e) {
		var index = parseInt($(this).closest('tr').attr('index'));
		grid.moveRowTo(index, index-1);
		e.stopPropagation();
	}).on('click', '.next', function(e) {
		var index = parseInt($(this).closest('tr').attr('index'));
		grid.moveRowTo(index, index+1);
		e.stopPropagation();
	}).on('click', '.bottom', function(e) {
		var index = parseInt($(this).closest('tr').attr('index'));
		grid.moveRowTo(index, -1);
		e.stopPropagation();
	});
})