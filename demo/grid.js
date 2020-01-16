require([
	'jquery',
	'datagrid'
], function($, datagrid) {
	grid = datagrid({
		box: '#box',

		dataFrom: {
			url: 'grid.json',
            dataType: 'json',
			dataFormatter: function(data) {
				return data.data;
			},
			collectFormatter: function(data) {
				return data.count;
			},
			totalFormatter: function(data) {
				return data.total;
			},
			idKey: 'id'
		},

		width: '100%',
		height: function() {
			return window.gridHeight || '600'
		},

		event: {
			click: function(data) {
				console.log('click:', data);
			},
			beforeSelect: function(data) {
				console.log('beforeSelect:', data);
				if (data.status == '待付款2') return false;
			},
			select: function(data) {
				console.log('select:', data);
			}
		},

		check: {
			multiple: true,
			checkAll: true,
			callType: 0
		},

		colModel: [
			{
				sys: 'index',
				title: '序号',
				frozen: 'left',
				width: 50,
				align: 'center',
				dataFormatter: function(index) {
					return '#'+index;
				},
				titleFormatter: false,
				count: {
					totalFormatter: function() {
						return '本页合计';
					}
				}
			}, {
				title: '状态',
				frozen: 'left',
				name: 'status',
				width: 60
			}, {
				title: '订单号',
				frozen: 'left',
				name: 'orderNum',
				width: 90,
				sort: {
					type: 'desc,asc',
					param: 'sortOrderNum'
				}
			}, {
				title: '买家信息',
				subCol: [
					{
						title: '头像',
						name: 'icon',
						width: 60,
						dataFormatter: function(value, row) {
							return '<div style="width:60px;height:60px;padding:5px 0;"><img style="max-width:100%;max-height:100%;" src="'+value+'?t='+row.getIndex()+'" /></div>';
						},
						titleFormatter: false
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
				title: '下单时间',
				name: 'buyDate',
				width: 120
			}, {
				title: '付款时间',
				name: 'payDate',
				width: 120
			}, {
				title: '货品数量',
				name: 'productCount',
				width: 60,
				count: true
			}, {
				title: '订单金额',
				subCol: [
					{
						title: '货品金额',
						name: 'productSum',
						width: 60,
						dataFormatter: function(value) {
							return value.toFixed(2);
						},
						count: {
							mode: 'number',  // number || type
							itemFormatter: function(value) {
								return parseFloat(value) || 0;
							},
							totalFormatter: function(value) {
								return value.toFixed(2);
							}
						}
					}, {
						title: '运费',
						name: 'logisticsSum',
						width: 60,
						dataFormatter: function(value) {
							return value.toFixed(2);
						},
						count: {
							mode: 'number',  // number || type
							itemFormatter: function(value) {
								return parseFloat(value) || 0;
							},
							totalFormatter: function(value) {
								return value.toFixed(2);
							}
						}
					}
				]
			}, {
				title: '支付方式',
				name: 'payType',
				width: 60,
				count: {
					mode: 'type',  // number || type
					itemFormatter: function(value) {
						return value == '支付宝' ? 'alipay' : 'wechat';
					},
					totalFormatter: function(value) {
						return [
							'支付宝:' + value.alipay,
							'微信:' + value.wechat
						];
					}
				}
			}, {
				title: '支付金额',
				name: 'paySum',
				width: 60,
				dataFormatter: function(value) {
					return value.toFixed(2);
				},
				count: {
					mode: 'number',  // number || type
					itemFormatter: function(value) {
						return parseFloat(value) || 0;
					},
					totalFormatter: function(value) {
						return value.toFixed(2);
					}
				}
			}, {
				title: '备注',
				name: 'remark',
				editable: {
					className: 'j-test j-test2',
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
				}
			}, {
				title: '操作',
				frozen: 'right',
				width: 160,
				dataFormatter: function(value, row) {
					var $btn = $([
						'<button class="top">置顶</button>',
						'<button class="prev">上移</button>',
						'<button class="next">下移</button>',
						'<button class="bottom">置底</button>'
					].join(''));
					$btn.click(function(e) {
						switch($(this).index()) {
						case 0:
							row.moveTo(0);
							break;
						case 1:
							row.moveTo(row.getIndex()-1);
							break;
						case 2:
							row.moveTo(row.getIndex()+1);
							break;
						case 3:
							row.moveTo(-1);
							break;
						}
						e.stopPropagation();
					});
					return $btn;
				}
			}
		]
	});

	$(window).resize(function() {
		grid.resize();
	});

	var newRowsIndex = 0;
	$('#insert').click(function() {
		var count = $('#insertCount').val();
		var arr = [];
		for (var i=0; i<count; i++) {
			arr.push({
				status: '新订单'+(++newRowsIndex),
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
});