/**
 * Version: 2.0
 * Author: Woody
 * Description: 创建时可省略new操作符，重构表格布局逻辑，优化滚动联动交互，优化表格行操作方法（类数组化）
 * Date: 2018-11-01
**/

;(function(w, d, $) {
	var _id = 0; //表格ID

	var _rowHeight = 36; //行高，用于表格自动高度

	var _opts = {}; //表格配置

	var _countBar = {}; //是否有汇总

	var _data = {}; //表格数据

	var _countData = {}; //表格汇总数据

	var _indexColFun = {}; //序号列方法

	var _scrollSize = 0; //浏览器滚动条大小

	var _sortBy = {}; //表格目前的排序

	var _eventType = ['click', 'focus', 'blur', 'change']; //支持的文本框事件

	$(function() {
		_scrollSize = (function() {
			var noScroll, scroll, oDiv = document.createElement('div');
			oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;';
			noScroll = document.body.appendChild(oDiv).clientWidth;
			oDiv.style.overflowY = 'scroll';
			scroll = oDiv.clientWidth;
			document.body.removeChild(oDiv);
			return (noScroll - scroll)
		})()
	});

	var jsonExtend = function(de, json) {
		for (var i in json) {
			de[i] = json[i]
		}
		return de
	};

	var getData = function(grid, page) {
		var data = {};
		var opt = _opts[grid.id];
		var sortBy = _sortBy[grid.id];
		page = page ? page : 1;
		data = typeof opt.data == 'function' ? opt.data() : opt.data;
		data.pageIndex = page;
		data.pageSize = opt.pageSize;
		if (sortBy) {
			sortBy = sortBy.split(',');
			data.sort = sortBy[0];
			data.sortBy = sortBy[1]
		}
		$.ajax({
			url: opt.url + '?t=' + (new Date()).getTime(),
			type: opt.method,
			data: data,
			dataType: opt.dataType,
			async: false,
			success: function(msg) {
				if (typeof msg == 'string') {
					msg = (new Function("return " + msg))()
				}
				data = msg
			}
		});
		if (opt.countDataFormatter) {
			_countData[grid.id] = opt.countDataFormatter(data)
		}
		grid.rowsCount = opt.rowsCountFormatter(data);
		return opt.dataFormatter(data)
	};

	var getColGroup = function(grid) {
		var opt = _opts[grid.id];
		var json = {
			main: [],
			left: [],
			right: []
		};

		if (opt.indexFormatter) {
			opt.colModel.unshift({
				width: opt.indexColWidth,
				title: '',
				name: 'DGridIndexCol',
				frozen: 'left',
				align: 'center'
			});
			_indexColFun[grid.id] = typeof opt.indexFormatter == 'function' ? opt.indexFormatter : function(index) {
				return index
			}
		} else {
			_indexColFun[grid.id] = function() {}
		};

		if (opt.selectModel > 0) {
			if (opt.selectAll && opt.selectModel == 2) {
				var $allChk = $('<input type="checkbox" class="d-grid-chk-all" />')
			} else {
				var $allChk = ''
			};
			if (opt.callSelectModel != 1) {
				opt.colModel.unshift({
					width: 35,
					title: $allChk,
					name: 'DGridCheckCol',
					frozen: 'left',
					align: 'center',
					dataFormatter: function(value, row) {
						var $chk = $('<input type="checkbox" class="d-grid-chk" />');
						return $chk
					}
				})
			}
		};

		var cols = opt.colModel;
		var sifter = function(cols, frozen) {
			var width = 0;
			for (var i in cols) {
				if (!cols[i]) continue;
				if (cols[i].subCol) {
					cols[i] = jsonExtend({
						title: '',
						align: 'center',
						frozen: 'none'
					}, cols[i]);
					cols[i].width = sifter(cols[i].subCol, cols[i].frozen);
				} else {
					cols[i] = jsonExtend({
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
					if (frozen) cols[i].frozen = frozen;
					if (cols[i].count == true) {
						_countBar[grid.id] = true;
						cols[i].count = function(value, row) {
							return parseFloat(value);
						}
					} else if (typeof cols[i].count == 'function') {
						_countBar[grid.id] = true
					}
					cols[i].width = (parseInt(cols[i].width) || 100) - 1 + 'px';
					json[cols[i].frozen == 'none' ? 'main' : cols[i].frozen].push(cols[i]);
				}
				width += parseInt(cols[i].width) + 1;
			}
			return width - 1 + 'px';
		};
		sifter(cols);
		return json
	};

	var initFrame = function(grid) {
		var id = grid.id;
		var opt = _opts[grid.id];

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

		var $headObjs = createThead(id, true);
		grid.root.head.main.dom.append($headObjs[0]);
		grid.root.head.left.dom.append($headObjs[1]);
		grid.root.head.right.dom.append($headObjs[2]);


		grid.root.body.main.dom.append('<table><tbody></tbody></table>');
		grid.root.body.left.dom.append('<table><tbody></tbody></table>');
		grid.root.body.right.dom.append('<table><tbody></tbody></table>');

		grid.box.html(grid.root.dom);
	};

	var createThead = function(id, n) {
		var cols = _opts[id].colModel;
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
					var $th = $('<th colspan="' + cols[i].colspan + '" rowspan="1"><div class="th" style="width:' + cols[i].width + ';height:35px;line-height:35px;text-align:' + cols[i].align + ';"></div></th>');
					$th.find('div').html(cols[i].title);
					for (var j in cols[i].subCol) {
						subCol.push(cols[i].subCol[j])
					}
				} else {
					var rowspan = maxDepth - cols[i].depth + 1;
					var $th = $('<th colspan="1" rowspan="' + (maxDepth - cols[i].depth + 1) + '"><div class="th" style="width:' + cols[i].width + ';height:' + (rowspan * 35 + rowspan - 1) + 'px;line-height:' + (rowspan * 35 + rowspan - 1) + 'px;text-align:' + cols[i].align + ';"></div></th>');
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
		var opt = _opts[grid.id];
		var $tr = $('<tr>');
		var insertTd = function(col) {
			var name = col.name;
			var value = col.dataFormatter(data[name], data);
			var $td = $('<td><div class="td" style="width:' + col.width + '; text-align:' + col.align + '">');
			if (name == 'DGridIndexCol') {
				$td.addClass('d-grid-td-index')
			};
			if (col.titleFormatter) {
				var title = col.titleFormatter(data[name], data);
				if (typeof title != 'string') title = '';
				$td.attr('title', title.replace(/<\/?[^>]*>/g, ''));
			}
			if (col.editable) {
				var $ipt = $('<input class="d-grid-ipt" type="text" />');
				$ipt.addClass(col.iptClassName).val(value);
				$td.find('div').html($ipt);
				for (var i in _eventType) {
					var eFun = col.editEvent[_eventType[i]];
					if (typeof eFun == 'function') {
						$ipt[_eventType[i]](eFun)
					}
				}
			} else {
				$td.find('div').html(value)
			};
			if (!col.overflow) {
				$td.find('div').addClass('z-hide-txt')
			}
			$tr.append($td)
		};
		for (var i = 0, len = cols.length; i < len; i++) {
			insertTd(cols[i]);
		}

		$tr.mouseenter(function() {
			var index = $(this).index();
			grid.root.body.left.dom.find('tr').eq(index).addClass('z-hover');
			grid.root.body.right.dom.find('tr').eq(index).addClass('z-hover');
			grid.root.body.main.dom.find('tr').eq(index).addClass('z-hover');
		}).mouseleave(function() {
			var index = $(this).index();
			grid.root.body.left.dom.find('tr').eq(index).removeClass('z-hover');
			grid.root.body.right.dom.find('tr').eq(index).removeClass('z-hover');
			grid.root.body.main.dom.find('tr').eq(index).removeClass('z-hover');
		});

		if (opt.selectModel != 0) {
			if (opt.callSelectModel == 0) {
				$tr.find('.d-grid-chk').click(function() {
					if ($tr.hasClass('z-crt')) {
						grid.unselectRows($tr.index());
					} else {
						grid.selectRows($tr.index());
					}
				})
			} else {
				$tr.click(function() {
					if ($(this).hasClass('z-crt')) {
						grid.unselectRows($(this).index());
					} else {
						grid.selectRows($(this).index());
					}
				})
			}
		}

		$tr.find('.d-grid-ipt').click(function(e) {
			e.stopPropagation();
		});
		return $tr
	};

	var createCount = function(id, cols, data) {
		var $tr = $('<tr>');
		var insertTd = function(col) {
			var name = col.name;
			var count = '';
			var $td = $('<td><div class="td" style="width:' + col.width + '">');
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

	var initRowHeight = function(grid) {
		var $centerTr = grid.root.body.main.dom.find('tr');
		var $leftTr = grid.root.body.left.dom.find('tr');
		var $rightTr = grid.root.body.right.dom.find('tr');
		for (var i = 0, len = $centerTr.length; i < len; i++) {
			var hl = $leftTr.eq(i).height();
			var hr = $rightTr.eq(i).height();
			var h = $centerTr.eq(i).height();
			h = h < (hl < hr ? hr : hl) ? (hl < hr ? hr : hl) : h;
			$leftTr.eq(i).height(h);
			$rightTr.eq(i).height(h);
			$centerTr.eq(i).height(h)
		}

		var $centerTr = grid.root.foot.main.dom.find('tr');
		var $leftTr = grid.root.foot.left.dom.find('tr');
		var $rightTr = grid.root.foot.right.dom.find('tr');
		var hl = $leftTr.height();
		var hr = $rightTr.height();
		var h = $centerTr.height();
		h = h < (hl < hr ? hr : hl) ? (hl < hr ? hr : hl) : h;
		$leftTr.height(h);
		$rightTr.height(h);
		$centerTr.height(h)

		grid.resize()
	};

	var updateRowIndex = function(grid) {
		var fun = _indexColFun[grid.id];
		grid.root.body.left.dom.find('.d-grid-td-index div.td').each(function(index) {
			var i = index + 1;
			$(this).html(fun(i));
		})
	};

	var synchronizeScroll = function(grid) {
		var timer, init, cum, dir;
		grid.root.body.main.dom.scroll(function() {
			grid.root.head.main.dom.find('table').css('left', -$(this).scrollLeft());
			grid.root.foot.main.dom.find('table').css('left', -$(this).scrollLeft());
			grid.root.body.left.dom.find('table').css('top', -$(this).scrollTop());
			grid.root.body.right.dom.find('table').css('top', -$(this).scrollTop());
		});

		grid.root.body.left.dom.on('mousewheel DOMMouseScroll', onMouseScroll);
		grid.root.body.right.dom.on('mousewheel DOMMouseScroll', onMouseScroll);
		function onMouseScroll(e) {
			var wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
			var delta = Math.max(-1, Math.min(1, wheel));

			clearTimeout(timer);
			if (dir != delta) {
				dir = delta;
				init = grid.root.body.main.dom.scrollTop();
				cum = 0;
			} else {
				timer = setTimeout(function() {
					init = grid.root.body.main.dom.scrollTop();
					cum = 0;
				}, 100);
			}

			cum += delta;
			grid.root.body.main.dom.stop().animate({
				'scrollTop': init - 100*cum
			}, 120);
			e.preventDefault();
		}
	};

	var bindEvent = function(grid) {
		var opt = _opts[grid.id];
		var $box = grid.box;
		grid.root.head.left.dom.find('.d-grid-chk-all').click(function() {
			if ($(this).attr('checked')) {
				grid.selectRows('all')
			} else {
				grid.unselectRows('all')
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

	var switchSelectState = function($trs, state) {
		if (!$trs) return;
		if (state == 'on') {
			$trs.addClass('z-crt').find('.d-grid-chk').attr('checked', 'true')
		};
		if (state == 'off') {
			$trs.removeClass('z-crt').find('.d-grid-chk').removeAttr('checked')
		}
	};
	
	var main = function(opt) {
		return new main.fn.init(opt);
	}

	main.fn = main.prototype = {
		init: function(opt) {
			opt = jsonExtend({
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
				rowsCountFormatter: function(data) {
					return data.total
				},
				width: '100%',
				height: 'auto',
				indexColWidth: 35,
				indexFormatter: false,
				selectModel: 0,  // 0：不支持选择；1：支持单选；2：支持多选
				callSelectModel: 0,  // 0: 通过点击复选框；1：通过点击行；2：通过点击复选框或点击行
				selectAll: false,  // 是否支持全选
				colModel: [],
				pageBar: true,
				rowOnClick: function() {},
				rowOnSelect: function() {}
			}, opt || {});
			this.id = _id;
			this.box = $(opt.box + ':first');
			if (this.box.length == 0) return this;
			this.rowsCount = 0;
			this.width = opt.width;
			this.height = opt.height;
			_opts[_id] = opt;
			_data[_id] = [];
			this.colsModel = getColGroup(this);
			initFrame(this);
			synchronizeScroll(this);
			bindEvent(this);
			this.resize();
			this.update(1);
			_id++;
			return this
		},

		update: function(page) {
			var me = this;
			var opt = _opts[me.id];
			var maxnum = me.pageCount || 1;
			page = page || parseInt(me.nowPage);
			page = page > maxnum ? maxnum : page;
			me.nowPage = page;
			this.root.body.main.dom.find('tbody').html('');
			this.root.body.left.dom.find('tbody').html('');
			this.root.body.right.dom.find('tbody').html('');
			if (opt.dataFrom == 'ajax') {
				var data = getData(me, page)
			} else if (opt.dataFrom == 'local') {
				var data = opt.data
			}
			_data[me.id] = [];
			me.pushRows(data);
			if (_countBar[me.id]) {

				this.root.foot.main.dom.html(createCount(me.id, this.colsModel.main, data));
				this.root.foot.left.dom.html(createCount(me.id, this.colsModel.left, data));
				this.root.foot.right.dom.html(createCount(me.id, this.colsModel.right, data));
				initRowHeight(me)
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
			/*var left = parseInt(_gridMain[me.id].find('.d-grid-hd table').css('left'));
			me.grid.find('.d-grid-bd').scrollLeft(-left);
			updateRowIndex(me);
			me.grid.find('.d-grid-scroll-y div').scrollTop(0);*/

			if (this.height == 'auto') {
				this.resize();
			}
			return this;
		},

		resize: function() {
			var me = this;
			var opt = _opts[this.id];
			var $box = this.box;
			var $th = $box.find('.d-grid-hd');
			var $allTb = $box.find('.d-grid-bd');
			var $center = $box.find('.d-grid-main');
			var $centerTb = $center.find('.d-grid-bd');
			var $centerGrid = $centerTb.find('table');
			var $frozeRight = $box.find('.d-grid-froze-right');
			var $scrollX = $box.find('.d-grid-scroll-x');
			var $scrollY = $box.find('.d-grid-scroll-y');
			var width = this.width.indexOf('%') >= 0 ? $box.width() * (parseFloat(this.width) || 0) / 100 : width;

			this.root.dom.width(width - 2);
			if (this.root.body.main.dom.find('table').innerWidth() > this.root.body.main.dom.width()) {
				var sh = _scrollSize
			} else {
				var sh = 0
			}

			if (this.height == 'auto') {
				var height = this.getData().length * _rowHeight + (sh ? sh : -1);
				this.root.dom.height('auto');
				this.root.body.main.dom.height(height);
				this.root.body.left.dom.height(height - sh);
				this.root.body.right.dom.height(height - sh);
			} else {
				var height = this.height - this.root.head.dom.height() - 2 - (_countBar[this.id] ? this.root.foot.dom.height() : 0) - (opt.pageBar ? 41 : 0);
				this.root.dom.height(this.height - 2);
				this.root.body.main.dom.height(height);
				this.root.body.left.dom.height(height - sh);
				this.root.body.right.dom.height(height - sh);
			}

			if (this.root.body.main.dom.find('table').height() - 1 > this.root.body.main.dom.height()) {
				var sw = _scrollSize
			} else {
				var sw = 0
			}
			this.root.head.right.dom.css('padding-right', sw);
			this.root.body.right.dom.css('right', sw);
			this.root.foot.right.dom.css('padding-right', sw);
			this.root.head.main.dom.css({
				'padding-left': this.root.head.left.dom.width(),
				'padding-right': this.root.head.right.dom.width() - 1 + sw
			});
			this.root.body.main.dom.find('table').css({
				'padding-left': this.root.body.left.dom.width(),
				'padding-right': this.root.body.right.dom.width() - 1
			});
			this.root.foot.main.dom.css({
				'padding-left': this.root.body.left.dom.width(),
				'padding-right': this.root.body.right.dom.width() - 1 + sw
			});
			return this;
		},

		pushRows: function(data) {
			this.insertRows(-1, data);
			return this;
		},

		unshiftRows: function(data) {
			this.insertRows(0, data);
			return this;
		},

		insertRows: function(index, data) {
			var me = this;
			var total = _data[this.id].length;
			if (index >= total) index = -1;
			if (index < -total) index = 0
			if (index == 0 || index == -1) {
				var fun = function(data) {
					if (index == 0) {
						var pend = 'prepend'
					} else {
						var pend = 'append'
					}
					_data[me.id][index == 0 ? 'unshift' : 'push'](data);
					this.root.body.main.dom.find('tbody')[pend](createRow(this, this.colsModel.main, data));
					this.root.body.left.dom.find('tbody')[pend](createRow(this, this.colsModel.left, data));
					this.root.body.right.dom.find('tbody')[pend](createRow(this, this.colsModel.right, data));
				}.bind(this);
			} else {
				var fun = function(data, index) {
					if (index < 0) index++;
					_data[me.id].splice(index, 0, data);
					this.root.body.left.dom.find('tr').eq(index).before(createRow(this, this.colsModel.left, data));
					this.root.body.main.dom.find('tr').eq(index).before(createRow(this, this.colsModel.main, data));
					this.root.body.right.dom.find('tr').eq(index).before(createRow(this, this.colsModel.right, data));
				}.bind(this);
			};
			if (index == -1) {
				for (var i = 0, len = data.length; i < len; i++) {
					fun(data[i])
				}
			} else {
				for (var i = data.length - 1; i >= 0; i--) {
					fun(data[i], index)
				}
			}
			updateRowIndex(me);
			initRowHeight(me);

			return this;
			var $imgs = this.grid.find('img');
			if ($imgs.length > 0) {
				var timer = setInterval(function() {
					initRowHeight(me)
				}, 200);
				$imgs.load(function() {
					initRowHeight(me);
					clearInterval(timer)
				})
			}
			return this;
		},

		deleteRows: function(index) {
			var me = this;
			if (index == 'all') {
				this.root.body.dom.find('tr').remove();
				_data[this.id] = [];
				this.resize()
			} else if (typeof index == 'number' || typeof index == 'string') {
				index = parseInt(index);
				var total = _data[this.id].length;
				if (index < -total || index >= total) return false;
				_data[this.id].splice(index, 1);
				this.root.body.left.dom.find('tr').eq(index).remove();
				this.root.body.main.dom.find('tr').eq(index).remove();
				this.root.body.right.dom.find('tr').eq(index).remove();
				updateRowIndex(me);
				this.resize()
			} else if (typeof index == 'object') {
				index = index.sort(function(a, b) {
					return b - a
				});
				for (var i in index) {
					me.deleteRows(index[i]);
				}
			}
			return this;
		},

		moveRowTo: function(index, seat) {
			var me = this;
			var total = _data[this.id].length;
			if (seat >= total) seat = total - 1;
			else if (seat < -total) seat = 0;
			else if (seat < 0) seat = total + seat;
			if (index >= total) index = total - 1;
			else if (index < -total) index = 0;
			else if (index < 0) index = total + index;
			if (index == seat) return this;
			var data = _data[this.id][index];
			_data[this.id].splice(index, 1);
			_data[this.id].splice(seat, 0, data);
			var $leftTbody = this.grid.find('.d-grid-froze-left .d-grid-bd tbody');
			var $rightTbody = this.grid.find('.d-grid-froze-right .d-grid-bd tbody');
			var $centerTbody = this.grid.find('.d-grid-main .d-grid-bd tbody');
			var $leftTr = $leftTbody.find('tr').eq(index);
			var $rightTr = $rightTbody.find('tr').eq(index);
			var $centerTr = $centerTbody.find('tr').eq(index);
			if (seat == total - 1) {
				$leftTbody.append($leftTr.removeClass('z-hover'));
				$rightTbody.append($rightTr.removeClass('z-hover'));
				$centerTbody.append($centerTr.removeClass('z-hover'))
			} else {
				if (seat > index) seat++;
				$leftTbody.find('tr').eq(seat).before($leftTr.removeClass('z-hover'));
				$rightTbody.find('tr').eq(seat).before($rightTr.removeClass('z-hover'));
				$centerTbody.find('tr').eq(seat).before($centerTr.removeClass('z-hover'))
			}
			updateRowIndex(me);
			return this;
		},

		selectRows: function(index) {
			var me = this;
			var opt = _opts[this.id];
			if (opt.selectModel != 2) {
				this.unselectRows('all');
			}
			if (index == 'all') {
				var $trs = this.root.body.dom.find('tr');
				switchSelectState($trs, 'on');
			} else {
				if (typeof index == 'number' || typeof index == 'string') {
					index = (index + '').split(',');
				}

				for (var i in index) {
					index[i] = parseInt(index[i]);
					var $temp = this.root.body.dom.find('tr:nth-child(' + (index[i]+1) + ')');
					switchSelectState($temp, 'on');
				}
			}
			opt.rowOnSelect(this.getData(index)[0]);
			return this;
		},

		unselectRows: function(index) {
			var me = this;
			if (index == 'all') {
				var $trs = this.root.body.dom.find('tr');
				switchSelectState($trs, 'off');
			} else {
				if (typeof index == 'number' || typeof index == 'string') {
					index = (index + '').split(',');
				}

				for (var i in index) {
					index[i] = parseInt(index[i]);
					var $temp = this.root.body.dom.find('tr:nth-child(' + (index[i]+1) + ')');
					switchSelectState($temp, 'off');
				}
			}
			return this;
		},

		getCrtRowsIndex: function() {
			var arr = [];
			this.root.body.main.dom.find('tr.z-crt').each(function() {
				var index = $(this).index();
				arr.push(index)
			});
			return arr;
		},

		getCrtRowsData: function() {
			var me = this;
			var arr = [];
			this.root.body.main.dom.find('tr.z-crt').each(function() {
				var index = $(this).index();
				arr.push(_data[me.id][index])
			});
			return arr;
		},

		resizeWidth: function(w) {
			this.width = w;
			this.resize();
			return this;
		},

		resizeHeight: function(h) {
			this.height = h;
			this.resize();
			return this;
		},

		getData: function(index) {
			index = index == undefined ? 'all' : index;
			if (index == 'all') {
				return _data[this.id];
			} else {
				if (typeof index == 'number' || typeof index == 'string') {
					index = (index + '').split(',');
				}

				var arr = [];
				for (var i in index) {
					index[i] = parseInt(index[i]);
					arr.push(_data[this.id][index[i]]);
				}
				return arr;
			}
		},

		setData: function(data) {
			var opt = _opts[this.id];
			if (opt.dataFrom == 'local') {
				opt.data = data;
				this.update(1);
			}
			return this;
		}
	}

	main.fn.init.prototype = main.fn;

	w.dGrid = w.d = main;

})(window, document, window.jQuery);