$(function() {
	var data = [];
	$.ajax({
		url: 'json/data.json',
		dataType: 'text',
		async: false,
		success: function(msg) {
			data = (new Function("return " + msg))();
		}
	});

	
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
		height: '460',//$('#box').height(),
		indexFormatter: function(index) {
			return '#'+index;
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
				title: '订单信息',
				frozen: 'left',
				subCol: [
					{
						title: '状态',
						name: 'status',
						width: 80,
						count: function() {
							return 1;
						},
						countFormatter: function(value, count) {
							return '本页合计<br />总合计';
						},
						dataFormatter: function(value, row) {
							if (value == '待发货') {
								var className = 's-fc-red';
							} else if (value == '待付款') {
								var className = 's-fc-blue';
							}
							return '<span class="'+(className||'')+'">'+value+'</span>';
						},
						sortBy: 'both', //none || asc || desc || both
						sortFrom: 'local', //ajax || local
						sortModel: 'string' //number || string
					}, {
						title: '订单号',
						name: 'orderId',
						width: 100,
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
						iptClassName: 'j-test j-test2',
						dataFormatter: function(value, row) {
							return '订单号：'+value;
						},
						titleFormatter: false
					}
				]
			}, {
				title: '商家信息',
				subCol: [
					{
						title: '业务归属',
						subCol: [
							{
								title: '业务经理',
								name: 'ywjl'
							}, {
								title: '门店',
								name: 'md'
							}, {
								title: '业务员',
								name: 'ywy'
							}
						]
					}, {
						title: '下单人',
						name: 'xdr'
					}, {
						title: '下单仓库',
						name: 'xdck'
					}
				]
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
				status: '新的数据'+(i+1),
				orderId: '20170100123456789000',
				username: 'test',
				name: '新的',
				receiverName: '吴迪',
				productPhone: '15012341234',
				buyDate: '2017-01-01 10:00:00',
				payDate: '2017-01-01 10:00:00',
				paySum: '100.00',
				payType: '支付宝',
				sum: '100.00',
				logSum: '0.00',
				dfSum: '0.00',
				numCount: '10',
				orderType: '批发',
				saleType: 'PC',
				remark: '',
				ywjl: '王朋',
				md: '梦多多',
				ywy: '王朋',
				xdr: '吴迪',
				xdck: '华中仓',
				dflx: '门店代发'
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