/**
 * Version: 2.0
 * Author: Woody
 * Description: 功能大纲：
 * 				1.创建时可省略new操作符 √
 * 				2.重构表格布局逻辑 √
 * 				3.优化滚动联动交互 √
 * 				4.优化自适应方法 √
 * 				5.重构表格行操作方法 √
 * 					└ 插入行  insertRows √
 * 					└ 获取所有行  getAllRows √
 * 					  根据序号获得行  getRows √
 * 					  获得当前页选中行  getCrtRows √
 * 					  通过条件获取行  getRowsBy √
 * 					  	└ 移动至指定位置  moveTo √
 * 						└ 删除  remove √
 * 						└ 获取序号  getIndex √
 * 						└ 获取数据  getData √
 * 						└ 选中  select √
 * 						└ 取消选中  unselect √
 * 						└ 刷新数据  update √
 * 						└ 遍历  each √
 * 						└ 获取指定序号行  eq √
 * 				6.优化排序方法  [3]
 * 				7.优化汇总行  [2]
 * 				8.优化分页栏，支持两种模式  [2]
 * 				9.增加系统列概念（隐藏列，序号列，复选列，分级列等） [3]
 * 				10.支持多级子行  [4]
 * 				11.列宽拖拽调整  [5]
 * 				12.整列隐藏  [5]
 * 				13.整列拖拽排序  [5]
 * 				14.保存表格已选行数据，并在表格刷新（搜索、跳页等情况）时回填已选状态，提供方法
 * 					└ 获取已选数据  getCrtData  [1]
 * 					└ 清除已选数据  cleanCrtData  [1]
 *              15.表格搜索功能  [3]
 * Date: 2018-11-01
**/

;(function(w, d, $) {
	var _countBar = {}; //是否有汇总

	var _countData = {}; //表格汇总数据

	_scrollSize = 0; //浏览器滚动条大小

	var _sortBy = {}; //表格目前的排序

	var _eventType = ['click', 'focus', 'blur', 'change']; //支持的文本框事件

	var _sysColName = ['__$tr', '__index', '__selected']; //系统列集合

	$(function() {
		_scrollSize = (function() {
			var noScroll, scroll, oDiv = d.createElement('div');
			oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;';
			noScroll = d.body.appendChild(oDiv).clientWidth;
			oDiv.style.overflowY = 'scroll';
			scroll = oDiv.clientWidth;
			d.body.removeChild(oDiv);
			return (noScroll - scroll);
		})();
	});

	var getData = function(grid, page, fun) {
		var param = {};
		var opt = grid.opt;
		var sortBy = _sortBy[grid.id];
		var data;
		page = page ? page : 1;
		param = typeof opt.data == 'function' ? opt.data() : opt.data;
		param.pageIndex = page;
		param.pageSize = opt.pageSize;
		if (sortBy) {
			sortBy = sortBy.split(',');
			param.sort = sortBy[0];
			param.sortBy = sortBy[1]
		}
		$.ajax({
			url: opt.url + '?t=' + (new Date()).getTime(),
			type: opt.method,
			data: param,
			dataType: opt.dataType,
			success: function(msg) {
				if (typeof msg == 'string') {
					msg = (new Function("return " + msg))();
				}
				if (opt.countDataFormatter) {
					_countData[grid.id] = opt.countDataFormatter(msg)
				}
				grid.rowsCount = opt.totalDataFormatter(msg);
				data = opt.dataFormatter(msg);
				fun(data);
			}
		});
	};

	var getColGroup = function(grid) {
		var opt = grid.opt;
		var json = {
			main: [],
			left: [],
			right: []
		};

		if (opt.check) {
			if (opt.check.callType != 2) {
				opt.colModel.unshift({
					width: 35,
					title: opt.check.multiple && opt.check.checkAll ? $('<input type="checkbox" class="d-grid-chk-all" />') : '',
					name: '__selected',
					frozen: 'left',
					align: 'center',
					dataFormatter: function(data, rh) {
						return $('<input type="checkbox" class="d-grid-chk" ' + (data ? 'checked="true"' : '') + ' />').click(function(e) {
							e.stopPropagation();
							if (data) rh.unselect();
							else rh.select();
							return false;
						});
					}
				})
			}
		};

		var cols = opt.colModel;

		var leftSpaceObj, rightSpaceObj;
		for (var i in cols) {
			if (cols[i].frozen == 'left' && !leftSpaceObj)  {
				leftSpaceObj = {
					space: true,
					width: -1
				};
			} else if (cols[i].frozen == 'right' && !rightSpaceObj) {
				rightSpaceObj = {
					space: true,
					width: -2
				};
			}
			if (leftSpaceObj && rightSpaceObj) break;
		}
		leftSpaceObj && cols.unshift(leftSpaceObj);
		rightSpaceObj && cols.push(rightSpaceObj);
		
		var sifter = function(cols, frozen) {
			var width = 0;
			for (var i in cols) {
				if (!cols[i]) continue;
				if (cols[i].subCol) {
					cols[i] = $.extend({
						title: '',
						align: 'center',
						frozen: 'none'
					}, cols[i]);
					cols[i].width = sifter(cols[i].subCol, cols[i].frozen);
				} else {
					if (cols[i].sys == 'index') {
						cols[i].name = '__index';
					}
					cols[i] = $.extend({
						title: '',
						name: '',
						width: 100,
						frozen: 'none',
						sortBy: 'none',
						sortParam: '',
						align: 'left',
						editable: false,
						iptClassName: '',
						overflow: true,
						dataFormatter: function(value, row) {
							return value
						},
						titleFormatter: function(value, row) {
							return value
						},
						count: false,
						countFormatter: function(count) {
							return count
						}
					}, cols[i]);

					if (!cols[i].space) {
						if (frozen) cols[i].frozen = frozen;
						if (cols[i].count == true) {
							_countBar[grid.id] = true;
							cols[i].count = function(value, row) {
								return parseFloat(value);
							}
						} else if (typeof cols[i].count == 'function') {
							_countBar[grid.id] = true
						}
						var width = (parseInt(cols[i].width) || 100) + 14;
						if (leftSpaceObj && cols[i].frozen == 'left') cols[0].width += width + 1;
						else if (rightSpaceObj && cols[i].frozen == 'right') cols[cols.length-1].width += width + 1;
	
						cols[i].width = width;
					}

					json[cols[i].frozen == 'none' ? 'main' : cols[i].frozen].push(cols[i]);
				}
				width += cols[i].width + 1;
			}
			return width - 1;
		};
		sifter(cols);
		return json
	};

	var initFrame = function(grid) {
		var opt = grid.opt;

		grid.root = {
			dom: $('<div class="d-grid"></div>')
		};
		grid.root.head = {
			dom: $('<div class="d-grid-head"></div>').appendTo(grid.root.dom)
		};
		grid.root.head.left = {
			dom: $('<div class="d-froze-left"></div>').appendTo(grid.root.head.dom)
		};
		grid.root.head.right = {
			dom: $('<div class="d-froze-right"></div>').appendTo(grid.root.head.dom)
		};
		grid.root.head.main = {
			dom: $('<div class="d-main"></div>').appendTo(grid.root.head.dom)
		};
		grid.root.body = {
			dom: $('<div class="d-grid-body"></div>').appendTo(grid.root.dom)
		};
		grid.root.body.left = {
			dom: $('<div class="d-froze-left"></div>').appendTo(grid.root.body.dom)
		};
		grid.root.body.right = {
			dom: $('<div class="d-froze-right"></div>').appendTo(grid.root.body.dom)
		};
		grid.root.body.main = {
			dom: $('<div class="d-main"></div>').appendTo(grid.root.body.dom)
		};

		if (_countBar[grid.id]) {
			grid.root.foot = {
				dom: $('<div class="d-grid-foot"></div>').appendTo(grid.root.dom)
			};
			grid.root.foot.left = {
				dom: $('<div class="d-froze-left"></div>').appendTo(grid.root.foot.dom).append('<table><tbody></tbody></table>')
			};
			grid.root.foot.right = {
				dom: $('<div class="d-froze-right"></div>').appendTo(grid.root.foot.dom).append('<table><tbody></tbody></table>')
			};
			grid.root.foot.main = {
				dom: $('<div class="d-main"></div>').appendTo(grid.root.foot.dom).append('<table><tbody></tbody></table>')
			};
		};

		if (opt.pageBar) {
			grid.root.page = {
				dom: $('<div class="d-grid-page"></div>').appendTo(grid.root.dom)
			};
		}

		var $headObjs = createThead(grid.opt.colModel, true);
		grid.root.head.main.dom.append($headObjs[0]);
		grid.root.head.left.dom.append($headObjs[1]);
		grid.root.head.right.dom.append($headObjs[2]);


		grid.root.body.main.dom.append('<table><tbody></tbody></table>');
		grid.root.body.left.dom.append('<table><tbody></tbody></table>');
		grid.root.body.right.dom.append('<table><tbody></tbody></table>');

		grid.box.html(grid.root.dom);
	};

	var createThead = function(cols, n) {
		var $hds = [$('<thead>'), $('<thead>'), $('<thead>')];

		//设置排序按钮
		var setSort = function($th, col) {
			if (col.sortBy == 'none') return $th;
			$th.addClass('d-grid-sort-th').data({
				sortType: col.sortBy == 'both' ? (col.sortInit == 'desc' ? 'desc,asc' : 'asc,desc') : col.sortBy,
				sortParam: col.sortParam ? col.sortParam : col.name,
				sortFrom: col.sortFrom,
				sortModel: col.sortModel
			}).append('<i class="df df-sort"></i><i class="df df-sort-desc"></i><i class="df df-sort-asc"></i>');
			return $th
		};

		//获取跨列数
		var getColspan = function(col) {
			var colspan = 0;
			if (col.subCol) {
				for (var i in col.subCol) {
					col.subCol[i].colspan = getColspan(col.subCol[i]);
					colspan += col.subCol[i].colspan
				}
			} else {
				colspan++
			}
			return colspan
		};
		for (var i in cols) {
			cols[i].colspan = getColspan(cols[i])
		};

		//获取json深度
		var getDepth = function(subCol) {
			var maxDepth = 1;
			for (var i in subCol) {
				subCol[i].depth = 1;
				if (subCol[i].subCol) {
					subCol[i].depth += getDepth(subCol[i].subCol)
				}
				maxDepth = maxDepth > subCol[i].depth ? maxDepth : subCol[i].depth
			}
			return maxDepth
		};
		getDepth(cols);

		var f = function(cols) {
			var $trs = [$('<tr>'), $('<tr>'), $('<tr>')];
			var subCol = [];
			var maxDepth = 0;
			for (var i in cols) {
				maxDepth = maxDepth > cols[i].depth ? maxDepth : cols[i].depth
			};
			for (var i = 0, len = cols.length; i < len; i++) {
				if (cols[i].subCol) {
					var $th = $('<th colspan="' + cols[i].colspan + '" rowspan="1"><div class="th" style="width:' + cols[i].width + 'px;height:35px;line-height:35px;text-align:' + cols[i].align + ';"></div></th>');
					$th.find('div').html(cols[i].title);
					for (var j in cols[i].subCol) {
						subCol.push(cols[i].subCol[j])
					}
				} else {
					var rowspan = maxDepth - cols[i].depth + 1;
					var $th = $('<th colspan="1" rowspan="' + (maxDepth - cols[i].depth + 1) + '"><div class="th" style="width:' + cols[i].width + 'px;height:' + (rowspan * 35 + rowspan - 1) + 'px;line-height:' + (rowspan * 35 + rowspan - 1) + 'px;text-align:' + cols[i].align + ';"></div></th>');
					setSort($th.find('div').html(cols[i].title), cols[i])
				};

				var frozen = cols[i].frozen;
				$trs[frozen == 'left' ? 1 : (frozen == 'right' ? 2 : 0)].append($th)
			};
			for (var i=0; i<3; i++) {
				if ($trs[i].find('th').length > 0) $hds[i].append($trs[i]);
			}
			if (subCol.length > 0) f(subCol)
		};
		f(cols);

		if (n) {
			return [
				$('<table>').html($hds[0]),
				$('<table>').html($hds[1]),
				$('<table>').html($hds[2])
			]
		} else {
			return [
				$('<div class="d-grid-hd">').html($('<table>').html($hds[0])),
				$('<div class="d-grid-hd">').html($('<table>').html($hds[1])),
				$('<div class="d-grid-hd">').html($('<table>').html($hds[2]))
			]
		}
	};

	var createRow = function(grid, cols, data) {
		var opt = grid.opt;
		var $tr = $('<tr>');
		var rh = new rowsHandle(grid, [data]);

		var insertTd = function(col) {
			var name = col.name;
			var value = data[name];

			var $td = $('<td><div class="td" style="width:' + col.width + 'px;text-align:' + col.align + '">');

			if (col.editable) {
				var $ipt = $('<input class="d-grid-ipt" type="text" />').addClass(col.iptClassName);
				$td.children('div').html($ipt);
				for (var i in _eventType) {
					var eFun = col.editEvent[_eventType[i]];
					if (typeof eFun == 'function') {
						$ipt[_eventType[i]](eFun);
					}
				}
				$ipt.keyup(function() {
					data[name] = $(this).val();
				});
			};
			if (!col.overflow) {
				$td.find('div').addClass('z-hide-txt');
			}
			$tr.append($td);

			function setVal(v) {
				if (col.titleFormatter) {
					var title = col.titleFormatter(v, data);
					if (typeof title != 'string') title = '';
					$td.attr('title', title.replace(/<\/?[^>]*>/g, ''));
				}

				if (col.editable) {
					$td.children('div').children('input').val(col.dataFormatter(v, rh));
				} else {
					$td.children('div').html(col.dataFormatter(v, rh));
				};
			}

			// 如果使用了数据则进行双向绑定
			if (name) {
				Object.defineProperty(data, name, (function(v) {
					return {
						get: function() {
							return v;
						},
						
						set: function(nv) {
							v = nv;
							setVal(v);
						}
					}
				})(data[name]));
	
				data[name] = value == undefined ? '' : value;
			} else {
				setVal();
			}
		};
		for (var i = 0, len = cols.length; i < len; i++) {
			insertTd(cols[i]);
		};

		$tr.click(function() {
			opt.rowOnClick(rh.getData());
		});
		if (opt.check && opt.check.callType != 1) {
			$tr.click(function() {
				if ($(this).hasClass('z-crt')) {
					rh.unselect();
				} else {
					rh.select();
				}
			});
		}

		$tr.find('.d-grid-ipt').click(function(e) {
			e.stopPropagation();
		});

		if (!data['__$tr']) data['__$tr'] = [];
		data['__$tr'].push($tr[0]);
		$tr.mouseenter(function() {
			$(data['__$tr']).addClass('z-hover');
		}).mouseleave(function() {
			$(data['__$tr']).removeClass('z-hover');
		});
		return $tr;
	};

	var createCount = function(id, cols, data) {
		var $tr = $('<tr>');
		var insertTd = function(col) {
			var name = col.name;
			var count = '';
			var $td = $('<td><div class="td" style="width:' + col.width + 'px">');
			if (typeof col.count == 'function') {
				count = (function(name) {
					var count = 0;
					for (var j in data) {
						count += col.count(col.dataFormatter(data[j][name], data[j]), data[j], j)
					}
					return count
				})(name)
			}
			$td.find('div').html(col.countFormatter(count, _countData[id]));
			$tr.append($td)
		};
		for (var i = 0, len = cols.length; i < len; i++) {
			insertTd(cols[i])
		}
		var $table = $('<table><tbody></tbody></table>');
		$table.find('tbody').html($tr);
		return $table;
	};

	var createPage = function(page, pageSize, rowCount) {
		page = page ? page : 1;
		var pageCount = Math.ceil(rowCount / pageSize);
		pageCount = pageCount ? pageCount : 1;
		var l = (page - 1) * pageSize + 1;
		var r = page * pageSize > rowCount ? rowCount : page * pageSize;
		var html = ['<a href="javascript:" class="page-first ' + (page == 1 ? 'z-dis' : '') + '"><i class="df df-tri-left ' + (page == 1 ? '' : 'z-live') + '"></i></a>', '<a href="javascript:" class="page-prev ' + (page == 1 ? 'z-dis' : '') + '"><i class="df df-tri-left ' + (page == 1 ? '' : 'z-live') + '"></i></a>', '<span>第<form><input type="text" value="' + page + '" maxnum="' + pageCount + '"></form>页 共' + pageCount + '页</span>', '<a href="javascript:" class="page-next ' + (page == pageCount ? 'z-dis' : '') + '"><i class="df df-tri-right ' + (page == pageCount ? '' : 'z-live') + '"></i></a>', '<a href="javascript:" class="page-last ' + (page == pageCount ? 'z-dis' : '') + '"><i class="df df-tri-right ' + (page == pageCount ? '' : 'z-live') + '"></i></a>', '<a href="javascript:" class="page-update"><i class="df df-refresh"></i></a>', '<p>显示 ' + (rowCount ? l : 0) + ' - ' + r + '，共' + rowCount + '条</p>', ];
		return html.join('')
	};

	var initRowHeight = function() {
		var $centerTr = this.root.body.main.dom.find('tr');
		var $leftTr = this.root.body.left.dom.find('tr');
		var $rightTr = this.root.body.right.dom.find('tr');
		for (var i = 0, len = $centerTr.length; i < len; i++) {
			var hl = $leftTr.eq(i).height();
			var hr = $rightTr.eq(i).height();
			var h = $centerTr.eq(i).height();
			h = h < (hl < hr ? hr : hl) ? (hl < hr ? hr : hl) : h;
			$leftTr.eq(i).height(h);
			$rightTr.eq(i).height(h);
			$centerTr.eq(i).height(h)
		}

		var $centerTr = this.root.foot.main.dom.find('tr');
		var $leftTr = this.root.foot.left.dom.find('tr');
		var $rightTr = this.root.foot.right.dom.find('tr');
		var hl = $leftTr.height();
		var hr = $rightTr.height();
		var h = $centerTr.height();
		h = h < (hl < hr ? hr : hl) ? (hl < hr ? hr : hl) : h;
		$leftTr.height(h);
		$rightTr.height(h);
		$centerTr.height(h)

		this.resize()
	};

	var updateRowIndex = function() {
		for (var i in this.data) {
			this.data[i].__index = parseInt(i) + 1;
		}
	};

	var scrollEvent = function() {
		var grid = this;
		this.root.body.dom.scroll(function() {
			var sl = $(this).scrollLeft();
			grid.root.head.main.dom[0].scrollLeft = sl;
			grid.root.foot.main.dom[0].scrollLeft = sl;

			grid.root.body.left.dom.css('left', sl);
			grid.root.body.right.dom.css('right', -sl);
			frozeShadow.call(grid);
		});
	};

	var frozeShadow = function () {
		var sl = this.root.body.dom.scrollLeft();
		var maxSl = this.root.body.main.dom.width()
				  - this.root.body.dom.width()
				  + this.sw;

		if (sl > 0 && !this.root.dom.hasClass('froze-left-shadow')) {
			this.root.dom.addClass('froze-left-shadow');
		} else if (sl == 0 && this.root.dom.hasClass('froze-left-shadow')) {
			this.root.dom.removeClass('froze-left-shadow');
		}

		if (sl < maxSl && !this.root.dom.hasClass('froze-right-shadow')) {
			this.root.dom.addClass('froze-right-shadow');
		} else if (sl == maxSl && this.root.dom.hasClass('froze-right-shadow')) {
			this.root.dom.removeClass('froze-right-shadow');
		}
	}

	var bindEvent = function(grid) {
		var $box = grid.box;
		grid.root.head.left.dom.find('.d-grid-chk-all').click(function() {
			if ($(this).attr('checked')) {
				grid.getAllRows().select();
			} else {
				grid.getAllRows().unselect();
			}
		});

		$box.find('.d-grid-sort-th').click(function() {
			var sortType = $(this).data('sortType').split(',');
			var sortParam = $(this).data('sortParam');
			if ($(this).hasClass('z-sort-desc')) {
				if (sortType.indexOf('asc') > -1) {
					$box.find('.d-grid-sort-th').removeClass('z-sort-desc z-sort-asc');
					$(this).removeClass('z-sort-desc').addClass('z-sort-asc');
					_sortBy[grid.id] = sortParam + ',asc'
				}
			} else if ($(this).hasClass('z-sort-asc')) {
				if (sortType.indexOf('desc') > -1) {
					$box.find('.d-grid-sort-th').removeClass('z-sort-desc z-sort-asc');
					$(this).removeClass('z-sort-asc').addClass('z-sort-desc');
					_sortBy[grid.id] = sortParam + ',desc'
				}
			} else {
				$box.find('.d-grid-sort-th').removeClass('z-sort-desc z-sort-asc');
				$(this).addClass('z-sort-' + sortType[0]);
				_sortBy[grid.id] = sortParam + ',' + sortType[0]
			}
			grid.update(1)
		});
	};
	
	var main = function(opt) {
		return new main.fn.init(opt);
	};

	main.fn = main.prototype = {
		init: function(opt) {
			opt = $.extend({
				box: 'body',
				dataFrom: 'ajax',
				url: '',
				method: 'POST',
				data: {},
				pageSize: 20,
				dataType: 'json',
				dataFormatter: function(data) {
					return data.data
				},
				countDataFormatter: false,
				totalDataFormatter: function(data) {
					return data.total
				},
				width: '100%',
				height: 'auto',
				colModel: [],
				check: false,
				pageBar: true,
				rowOnClick: function() {},
				rowBeforeSelect: function() {},
				rowOnSelect: function() {}
			}, opt || {});

			if (opt.check) {
				opt.check = $.extend({
					multiple: false,
					checkAll: false,
					callType: 0  // 0: 通过点击复选框或点击行；1：通过点击复选框；2：通过点击行；
				}, is(opt.check) == 'object' ? opt.check : {});
			}

			this.opt = opt;
			this.box = $(opt.box + ':first');
			if (this.box.length == 0) return this;
			this.rowsCount = 0;
			this.width = opt.width;
			this.height = opt.height;
			this.colsModel = getColGroup(this);
			initFrame(this);
			scrollEvent.call(this);
			bindEvent(this);
			this.resize();
			this.update(1);
			return this
		},

		update: function(page) {
			var me = this;
			var opt = this.opt;
			var maxnum = me.pageCount || 1;
			page = page || parseInt(me.nowPage);
			page = page > maxnum ? maxnum : page;
			me.nowPage = page;
			this.data = [];
			this.root.body.main.dom.find('tbody').html('');
			this.root.body.left.dom.find('tbody').html('');
			this.root.body.right.dom.find('tbody').html('');

			var create = function (data) {
				me.pushRows(data);
				if (_countBar[me.id]) {
	
					this.root.foot.main.dom.html(createCount(me.id, this.colsModel.main, data));
					this.root.foot.left.dom.html(createCount(me.id, this.colsModel.left, data));
					this.root.foot.right.dom.html(createCount(me.id, this.colsModel.right, data));
					initRowHeight.call(me)
				};
				if (opt.pageBar) {
					this.root.page.dom.html(createPage(page, opt.pageSize, me.rowsCount));
					me.pageCount = this.root.page.dom.find('input').attr('maxnum');
					this.root.page.dom.find('a').click(function() {
						if ($(this).hasClass('z-dis')) return;
						if ($(this).hasClass('page-update')) {
							me.update();
							return
						};
						var page = me.root.page.dom.find('input').val();
						if ($(this).hasClass('page-first')) {
							page = 1
						} else if ($(this).hasClass('page-prev')) {
							page = --page
						} else if ($(this).hasClass('page-next')) {
							page = ++page
						} else if ($(this).hasClass('page-last')) {
							page = me.root.page.dom.find('input').attr('maxnum')
						}
						me.update(parseInt(page))
					});
					this.root.page.dom.find('form').submit(function() {
						var $ipt = me.root.page.dom.find('input');
						var maxnum = $ipt.attr('maxnum');
						var page = parseInt($ipt.val()) || 1;
						page = page > maxnum ? maxnum : page;
						me.update(parseInt(page));
						return false
					});
					this.root.page.dom.find('input').focus(function() {
						$(this).select()
					}).blur(function() {
						$(this).val(me.nowPage)
					})
				};
	
				if ((typeof this.height == 'function' ? this.height() : this.height) == 'auto') {
					this.resize();
				}
			}.bind(this);

			if (opt.dataFrom == 'ajax') {
				getData(me, page, create);
			} else if (opt.dataFrom == 'local') {
				create(opt.data);
			}
			return this;
		},

		resize: function() {
			var opt = this.opt;
			var $box = this.box;
			var width = this.width.indexOf('%') >= 0 ? $box.width() * (parseFloat(this.width) || 0) / 100 : width;
			var height =  typeof this.height == 'function' ? this.height() : this.height;

			this.root.dom.width(width - 2);

			this.sw = this.sh = 0;
			if (height == 'auto') {
				this.root.dom.height('auto');
				this.root.body.dom.height('auto');

				if (this.root.body.main.dom.height() > this.root.body.dom.height()) {
					this.sw = _scrollSize;
				}
			} else {
				var h = height - this.root.head.dom.height() - 2 - (_countBar[this.id] ? this.root.foot.dom.height() : 0) - (opt.pageBar ? 41 : 0);
				this.root.dom.height(height - 2);
				this.root.body.dom.height(h);

				if (this.root.body.main.dom.height() > this.root.body.dom.height()) {
					this.sw = _scrollSize;
				}

				if (this.root.body.main.dom.innerWidth() + this.sw > this.root.body.dom.width()) {
					this.sh = _scrollSize;

					if (this.root.body.main.dom.height() + this.sh > this.root.body.dom.height()) {
						this.sw = _scrollSize;
					}
				}
			}
			this.root.head.right.dom.css('padding-right', this.sw);
			this.root.foot.right.dom.css('padding-right', this.sw);

			frozeShadow.call(this);
			return this;
		},

		// 向表格最下面插入行
		pushRows: function(data) {
			this.insertRows(0, data);
			return this;
		},

		// 向表格最上面插入行
		unshiftRows: function(data) {
			this.insertRows(0, data);
			return this;
		},

		// 向指定位置插入行
		insertRows: function(index, data) {
			var me = this;
			var total = this.data.length;
			if (index >= total) index = -1;
			else if (index < -total) index = 0;
			if (total == 0 || index == -1) {
				var fun = function(data) {
					this.data.push(data);
					this.root.body.main.dom.find('tbody').append(createRow(this, this.colsModel.main, data));
					this.root.body.left.dom.find('tbody').append(createRow(this, this.colsModel.left, data));
					this.root.body.right.dom.find('tbody').append(createRow(this, this.colsModel.right, data));
				}.bind(this);
			} else {
				var $trs = this.data[index].__$tr;
				var fun = function(data) {
					this.data.splice(index++, 0, data);
					$($trs[0]).before(createRow(this, this.colsModel.main, data));
					$($trs[1]).before(createRow(this, this.colsModel.left, data));
					$($trs[2]).before(createRow(this, this.colsModel.right, data));
				}.bind(this);
			};
			for (var i = 0, len = data.length; i < len; i++) {
				fun(data[i])
			}
			updateRowIndex.call(me);
			initRowHeight.call(me);

			var $imgs = this.root.body.dom.find('img');
			if ($imgs.length > 0) {
				$imgs.load(function() {
					initRowHeight.call(me);
				})
			}
			return this;
		},
		
		// 根据序号获取行
		getRows: function(index) {
			if (is(index) == 'number' || is(index) == 'string') index = [index];
			else if(is(index) != 'array') return;

			index = index.sort();

			var a = [];
			for (var i in index) {
				var n = index[i];
				if (n < 0 || n >= this.data.length) continue;
				a.push(this.data[n]);
			}
			return new rowsHandle(this, a);
		},

		// 获取当前页所有行
		getAllRows: function() {
			return new rowsHandle(this, this.data);
		},

		// 获取当前页所有选中行
		getCrtRows: function() {
			var a = [];
			for (var i in this.data) {
				if (this.data[i].__selected) {
					a.push(this.data[i]);	
				}
			}
			return new rowsHandle(this, a);
		},

		// 根据条件获取行
		getRowsBy: function(o) {
			var a = [];
			for (var i in this.data) {
				var state = true;
				for (var j in o) {
					if (_sysColName.indexOf(j) == -1 && this.data[i][j] !== undefined) {
						if (is(o[j]) == 'array') {
							if (o[j].indexOf(this.data[i][j]) == -1) {
								state = false;
								break;
							}
						} else if (o[j] != this.data[i][j]) {
							state = false;
							break;
						}
					}
				}
				if (state) a.push(this.data[i]);
			}
			return new rowsHandle(this, a);
		},

		// 修改表格宽度
		setWidth: function(w) {
			this.width = w;
			this.resize();
			return this;
		},

		// 修改表格高度
		setHeight: function(h) {
			this.height = h;
			this.resize();
			return this;
		}
	};

	main.fn.init.prototype = main.fn;

	w.dGrid = w.d = main;

	var rowsDataClean = function(data) {
		var json = {};
		for (var i in data) {
			if (_sysColName.indexOf(i) == -1) {
				json[i] = data[i];
			}
		}
		return json;
	}
	
	// 行操作构造函数
	var rowsHandle = function(grid, data) {
		this.grid = grid;
		this.rows = data;
		this.length = data.length;
		return this;
	};

	rowsHandle.prototype = {
		moveTo: function(index) {
			var total = grid.data.length - this.length;
			if (index >= total) index = -1;
			else if (index < -total) index = 0;

			var data = [];
			for (var i = this.length-1; i>=0; i--) {
				data.unshift(this.grid.data.splice(this.rows[i].__index-1, 1)[0]);
			}

			if (total == 0 || index == -1) {
				var fun = function(data) {
					this.data.push(data);
					this.root.body.main.dom.find('tbody').append(data.__$tr[0]);
					this.root.body.left.dom.find('tbody').append(data.__$tr[1]);
					this.root.body.right.dom.find('tbody').append(data.__$tr[2]);
				}.bind(this.grid);
			} else {
				var $trs = this.grid.data[index].__$tr;
				var fun = function(data) {
					this.data.splice(index++, 0, data);
					$($trs[0]).before(data.__$tr[0]);
					$($trs[1]).before(data.__$tr[1]);
					$($trs[2]).before(data.__$tr[2]);
				}.bind(this.grid);
			};
			for (var i = 0; i < data.length; i++) {
				fun(data[i]);
			}
			updateRowIndex.call(grid);
			return this;
		},

		remove: function() {
			for (var i = this.rows.length-1; i>=0; i--) {
				$(this.rows[i].__$tr).remove();
				this.grid.data.splice(this.rows[i].__index-1, 1);
			}
			updateRowIndex.call(this.grid);
			this.grid.resize();
			return this;
		},

		getIndex: function() {
			var data = [];
			for (var i in this.rows) {
				data.push(this.rows[i].__index-1);
			}
			return data.length == 1 ? data[0] : data;
		},

		getData: function() {
			var data = [];
			for (var i in this.rows) {
				data.push(rowsDataClean(this.rows[i]));
			}
			return data.length == 1 ? data[0] : data;
		},

		select: function() {
			var grid = this.grid;
			this.each(function() {
				if ($(this.rows[0].__$tr).hasClass('z-crt')) return;

				if (grid.opt.rowBeforeSelect(this.getData()) === false) return;
				
				if (!grid.opt.check.multiple) {
					grid.getCrtRows().unselect();
				}

				$(this.rows[0].__$tr).addClass('z-crt');
				this.rows[0].__selected = true;

				grid.opt.rowOnSelect(rowsDataClean(this));
			});
			return this;
		},

		unselect: function() {
			for (var i in this.rows) {
				var row = this.rows[i];
				if (!$(row.__$tr).hasClass('z-crt')) continue;
				$(row.__$tr).removeClass('z-crt');
				row.__selected = false;
			}
			return this;
		},

		update: function(data) {
			for (var i in this.rows) {
				if (!data[i]) return this;
				for (var j in this.rows[i]) {
					if (_sysColName.indexOf(j) == -1 && data[i][j] !== undefined) {
						this.rows[i][j] = data[i][j];
					}
				}
			}
			return this;
		},

		each: function(fun) {
			for (var i in this.rows) {
				var rh = new rowsHandle(this.grid, [this.rows[i]]);
				if (fun.call(rh, i) === false) break;
			}
			return this;
		},

		eq: function(n) {
			if (n >= this.length || n < -this.length) return;
			return new rowsHandle(this.grid, [this.rows[n < 0 ? this.length + n : n]]);
		}
	};

})(window, document, window.jQuery);