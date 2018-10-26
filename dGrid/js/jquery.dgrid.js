;(function(w, d, $) {

	if (!$) {
		console.warn('该框架依赖于jQuery，请先引入jQuery');
		return;
	}

	var _id = 0; //表格ID

	var _rowHeight = 36; //行高，用于表格自动高度

	var _opts = {}; //表格配置

	var _cols = {}; //列配置

	var _countBar = {}; //是否有汇总

	var _data = {}; //表格数据

	var _countData = {}; //表格汇总数据

	var _indexColFun = {}; //序号列方法

	var _scrollSize = 0; //浏览器滚动条大小

	var _sortBy = {}; //表格目前的排序

	var _eventType = ['click', 'focus', 'blur', 'change']; //支持的文本框事件

	var _tbodyObj = {}; //表格表体对象

	var _countObj = {}; //表格会总行对象

	var _pageObj = {}; //表格分页栏对象

	var _gridMain = {}; //主表格

	var _gridFrozeLeft = {}; //左固定表格

	var _gridFrozeRight = {}; //右固定表格

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
		for (let i in json) {
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
			for (let i in cols) {
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

		grid.grid = $('<div class="d-grid d-grid-box">');
		_gridMain[id] = $('<div class="d-grid-main">');
		_gridFrozeLeft[id] = $('<div class="d-grid-froze d-grid-froze-left">');
		_gridFrozeRight[id] = $('<div class="d-grid-froze d-grid-froze-right">');

		var $gridThs = createThead(id);
		var $gridBdTemp = $('<div class="d-grid-bd"></div>');
		var tbTpl = '<table><tbody></tbody></table>';

		_gridMain[id].append($gridThs[0]).append($gridBdTemp.clone().html(tbTpl));
		_gridFrozeLeft[id].append($gridThs[1]).append($gridBdTemp.clone().html(tbTpl).append('<div class="d-grid-scroll-x"></div>'));
		_gridFrozeRight[id].append($gridThs[2]).append($gridBdTemp.clone().html(tbTpl).append('<div class="d-grid-scroll-x"></div>'));

		if (_countBar[grid.id]) {
			var $gridCountTemp = $('<div class="d-grid-count"></div>');

			_gridFrozeLeft[id].append($gridCountTemp.clone().html(tbTpl));
			_gridFrozeRight[id].append($gridCountTemp.clone().html(tbTpl));
			_gridMain[id].append($gridCountTemp.clone().html(tbTpl));

			_countObj[id] = {
				main: _gridMain[id].find('.d-grid-count tbody'),
				left: _gridFrozeLeft[id].find('.d-grid-count tbody'),
				right: _gridFrozeRight[id].find('.d-grid-count tbody')
			}
		};

		if (opt.pageBar) {
			_pageObj[id] = $('<div class="d-grid-page"></div>');
		}

		_tbodyObj[id] = {
			main: _gridMain[id].find('.d-grid-bd tbody'),
			left: _gridFrozeLeft[id].find('.d-grid-bd tbody'),
			right: _gridFrozeRight[id].find('.d-grid-bd tbody')
		};
		grid.grid.append(_gridMain[id]).append(_gridFrozeLeft[id]).append(_gridFrozeRight[id]).append('<div class="d-grid-scroll-y"><div><span></span></div></div>').append(_pageObj[id]);
		grid.box.html(grid.grid)
	};

	var createThead = function(id) {
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
				for (let i in col.subCol) {
					col.subCol[i].colspan = getColspan(col.subCol[i]);
					colspan += col.subCol[i].colspan
				}
			} else {
				colspan++
			}
			return colspan
		};
		for (let i in cols) {
			cols[i].colspan = getColspan(cols[i])
		};

		//获取json深度
		var getDepth = function(subCol) {
			var maxDepth = 1;
			for (let i in subCol) {
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
			for (let i in cols) {
				maxDepth = maxDepth > cols[i].depth ? maxDepth : cols[i].depth
			};
			for (let i = 0, len = cols.length; i < len; i++) {
				if (cols[i].subCol) {
					var $th = $('<th colspan="' + cols[i].colspan + '" rowspan="1"><div class="th" style="width:' + cols[i].width + ';height:35px;line-height:35px;text-align:' + cols[i].align + ';"></div></th>');
					$th.find('div').html(cols[i].title);
					for (let j in cols[i].subCol) {
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
			for (let i=0; i<3; i++) {
				if ($trs[i].find('th').length > 0) $hds[i].append($trs[i]);
			}
			if (subCol.length > 0) f(subCol)
		};
		f(cols);

		return [
			$('<div class="d-grid-hd">').html($('<table>').html($hds[0])),
			$('<div class="d-grid-hd">').html($('<table>').html($hds[1])),
			$('<div class="d-grid-hd">').html($('<table>').html($hds[2]))
		]
	};

	var createRow = function(id, cols, data) {
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
				for (let i in _eventType) {
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
		for (let i = 0, len = cols.length; i < len; i++) {
			insertTd(cols[i])
		}
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
					for (let j in data) {
						count += col.count(col.dataFormatter(data[j][name], data[j]), data[j], j)
					}
					return count
				})(name)
			}
			$td.find('div').html(col.countFormatter(count, _countData[id]));
			$tr.append($td)
		};
		for (let i = 0, len = cols.length; i < len; i++) {
			insertTd(cols[i])
		}
		return $tr
	};
	var createPage = function(page, pageSize, rowCount) {
		page = page ? page : 1;
		var pageCount = Math.ceil(rowCount / pageSize);
		pageCount = pageCount ? pageCount : 1;
		var l = (page - 1) * pageSize + 1;
		var r = page * pageSize > rowCount ? rowCount : page * pageSize;
		var html = ['<a href="javascript:" class="page-first ' + (page == 1 ? 'z-dis' : '') + '"><i class="df df-first-page ' + (page == 1 ? '' : 'z-live') + '"></i></a>', '<a href="javascript:" class="page-prev ' + (page == 1 ? 'z-dis' : '') + '"><i class="df df-prev-page ' + (page == 1 ? '' : 'z-live') + '"></i></a>', '<span>第<form><input type="text" value="' + page + '" maxnum="' + pageCount + '"></form>页 共' + pageCount + '页</span>', '<a href="javascript:" class="page-next ' + (page == pageCount ? 'z-dis' : '') + '"><i class="df df-next-page ' + (page == pageCount ? '' : 'z-live') + '"></i></a>', '<a href="javascript:" class="page-last ' + (page == pageCount ? 'z-dis' : '') + '"><i class="df df-last-page ' + (page == pageCount ? '' : 'z-live') + '"></i></a>', '<a href="javascript:" class="page-update"><i class="df df-refresh-page"></i></a>', '<p>显示 ' + (rowCount ? l : 0) + ' - ' + r + '，共' + rowCount + '条</p>', ];
		return html.join('')
	};
	var initRowHeight = function(grid) {
		var $centerTr = grid.box.find('.d-grid-main .d-grid-bd tr, .d-grid-main .d-grid-count tr');
		var $leftTr = grid.box.find('.d-grid-froze-left .d-grid-bd tr, .d-grid-froze-left .d-grid-count tr');
		var $rightTr = grid.box.find('.d-grid-froze-right .d-grid-bd tr, .d-grid-froze-right .d-grid-count tr');
		for (let i = 0, len = $centerTr.length; i < len; i++) {
			var hl = $leftTr.eq(i).height();
			var hr = $rightTr.eq(i).height();
			var h = $centerTr.eq(i).height();
			h = h < (hl < hr ? hr : hl) ? (hl < hr ? hr : hl) : h;
			$leftTr.eq(i).height(h);
			$rightTr.eq(i).height(h);
			$centerTr.eq(i).height(h)
		}
		grid.resize()
	};
	var updateRowIndex = function(grid) {
		var fun = _indexColFun[grid.id];
		var $tr = grid.grid.find('.d-grid-main .d-grid-bd tr');
		var $leftTr = grid.grid.find('.d-grid-froze-left .d-grid-bd tr');
		var $rightTr = grid.grid.find('.d-grid-froze-right .d-grid-bd tr');
		var $indexTd = grid.grid.find('.d-grid-td-index div.td');
		$tr.each(function(index) {
			var i = index + 1;
			$(this).attr('index', index);
			$leftTr.eq(index).attr('index', index);
			$rightTr.eq(index).attr('index', index);
			$indexTd.eq(index).html(fun(i)).attr('index', i)
		})
	};
	var synchronizeScroll = function(grid) {
		var $box = grid.box;
		var scrollY = $box.find('.d-grid-scroll-y div');
		var scrollX = $box.find('.d-grid-main .d-grid-bd');
		var th = $box.find('.d-grid-main .d-grid-hd table');
		var tb = $box.find('.d-grid-bd');
		var tc = $box.find('.d-grid-main .d-grid-count table');
		var inTb = false;
		scrollY.scroll(function() {
			var top = $(this).scrollTop();
			tb.scrollTop(top)
		});
		scrollX.scroll(function() {
			var left = $(this).scrollLeft();
			th.css({
				'position': 'relative',
				'left': -left
			});
			tc.css({
				'position': 'relative',
				'left': -left
			})
		});
		tb.mouseenter(function() {
			inTb = true
		}).mouseleave(function() {
			inTb = false
		});
		var scrollFun = function(e) {
			if (!inTb) return;
			e = e || w.event;
			var maxTop = scrollY.find('span').height() - scrollY.height();
			if (e.wheelDelta) {
				var s = -e.wheelDelta > 0 ? 10 : -20
			} else if (e.detail) {
				var s = e.detail > 0 ? 20 : -40
			};
			var top = scrollY.scrollTop();
			if ((top > 0 && s < 0) || (top < maxTop && s > 0)) {
				scrollY.scrollTop(top + s);
				e.preventDefault()
			}
		};
		if (d.addEventListener) {
			d.addEventListener('DOMMouseScroll', scrollFun, false)
		}
		w.onmousewheel = d.onmousewheel = scrollFun
	};
	var bindEvent = function(grid) {
		var opt = _opts[grid.id];
		var $box = grid.box;
		$box.find('.d-grid-chk-all').click(function() {
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
		var trClick = function(e) {
			var index = $(this).attr('index');
			var data = _data[grid.id][index];
			if (opt.selectModel > 0 && opt.callSelectModel > 0) {
				if ($(this).hasClass('z-crt')) {
					grid.unselectRows(index)
				} else {
					if (opt.selectModel == 1) {
						grid.unselectRows('all')
					}
					grid.selectRows(index)
				}
			}
			opt.rowOnClick($(this), data, e)
		};
		var trEnter = function() {
			var index = parseInt($(this).attr('index')) + 1;
			var $trs = grid.box.find('.d-grid-bd tr:nth-child(' + index + ')');
			$trs.addClass('z-hover')
		};
		var trLeave = function() {
			var index = parseInt($(this).attr('index')) + 1;
			var $trs = grid.box.find('.d-grid-bd tr:nth-child(' + index + ')');
			$trs.removeClass('z-hover')
		};
		var chkClick = function(e) {
			var $tr = $(this).closest('tr');
			var index = $tr.attr('index');
			if ($tr.hasClass('z-crt')) {
				grid.unselectRows(index)
			} else {
				if (opt.selectModel == 1) {
					grid.unselectRows('all')
				}
				grid.selectRows(index)
			}
			e.stopPropagation()
		};
		var iptClick = function(e) {
			e.stopPropagation()
		};
		$box.off('click', '.d-grid-bd tbody tr').off('mouseenter', '.d-grid-bd tbody tr').off('mouseleave', '.d-grid-bd tbody tr').off('click', '.d-grid-bd tbody tr .d-grid-chk').off('click', '.d-grid-bd tbody tr .d-grid-ipt').on('click', '.d-grid-bd tbody tr', trClick).on('mouseenter', '.d-grid-bd tbody tr', trEnter).on('mouseleave', '.d-grid-bd tbody tr', trLeave).on('click', '.d-grid-bd tbody tr .d-grid-chk', chkClick).on('click', '.d-grid-bd tbody tr .d-grid-ipt', iptClick)
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
				selectModel: 0,
				callSelectModel: 0,
				selectAll: false,
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
			_cols[_id] = getColGroup(this);
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
			var cols = _cols[me.id];
			var maxnum = me.pageCount || 1;
			page = page || parseInt(me.nowPage);
			page = page > maxnum ? maxnum : page;
			me.nowPage = page;
			_tbodyObj[me.id].left.html('');
			_tbodyObj[me.id].main.html('');
			_tbodyObj[me.id].right.html('');
			if (opt.dataFrom == 'ajax') {
				var data = getData(me, page)
			} else if (opt.dataFrom == 'local') {
				var data = opt.data
			}
			_data[me.id] = [];
			me.pushRow(data);
			if (_countBar[me.id]) {
				_countObj[me.id].left.html(createCount(me.id, cols.left, data));
				_countObj[me.id].main.html(createCount(me.id, cols.main, data));
				_countObj[me.id].right.html(createCount(me.id, cols.right, data));
				initRowHeight(me)
			};
			if (opt.pageBar) {
				_pageObj[me.id].html(opt.pageBar ? createPage(page, opt.pageSize, me.rowsCount) : '');
				me.pageCount = _pageObj[me.id].find('input').attr('maxnum');
				_pageObj[me.id].find('a').click(function() {
					if ($(this).hasClass('z-dis')) return;
					if ($(this).hasClass('page-update')) {
						me.update();
						return
					};
					var page = _pageObj[me.id].find('input').val();
					if ($(this).hasClass('page-first')) {
						page = 1
					} else if ($(this).hasClass('page-prev')) {
						page = --page
					} else if ($(this).hasClass('page-next')) {
						page = ++page
					} else if ($(this).hasClass('page-last')) {
						page = _pageObj[me.id].find('input').attr('maxnum')
					}
					me.update(parseInt(page))
				});
				_pageObj[me.id].find('form').submit(function() {
					var $ipt = _pageObj[me.id].find('input');
					var maxnum = $ipt.attr('maxnum');
					var page = parseInt($ipt.val()) || 1;
					page = page > maxnum ? maxnum : page;
					me.update(parseInt(page));
					return false
				});
				_pageObj[me.id].find('input').focus(function() {
					$(this).select()
				}).blur(function() {
					$(this).val(me.nowPage)
				})
			};
			var left = parseInt(_gridMain[me.id].find('.d-grid-hd table').css('left'));
			me.grid.find('.d-grid-bd').scrollLeft(-left);
			updateRowIndex(me);
			me.grid.find('.d-grid-scroll-y div').scrollTop(0);

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

			this.grid.width(width - 2);

			if ($centerGrid.width() > $centerTb.width()) {
				var sh = _scrollSize
			} else {
				var sh = 0
			}
			$scrollX.height(sh);
			$scrollY.find('span').height($centerGrid.height() + sh);

			if (this.height == 'auto') {
				this.grid.height('auto');
				$allTb.height(this.getData().length * _rowHeight + (sh ? sh : -1));
			} else {
				this.grid.height(this.height - 2);
				$allTb.height(this.height - $th.height() - 2 - (_countBar[this.id] ? $center.find('.d-grid-count').height() : 0) - (opt.pageBar ? 41 : 0));
			}

			if ($centerGrid.height() - 1 > $centerTb.height()) {
				var sw = _scrollSize
			} else {
				var sw = 0
			}
			$scrollY.width(sw).find('div').css({
				'top': $th.height() - 1,
				'bottom': (_countBar[me.id] ? $center.find('.d-grid-count').height() : 0) + (opt.pageBar ? 41 : 0)
			});
			$frozeRight.css('right', sw);
			$center.css({
				'margin-left': _gridFrozeLeft[me.id].width(),
				'margin-right': _gridFrozeRight[me.id].width() - 1 + sw
			});
			return this;
		},
		pushRow: function(data) {
			this.insertRow(-1, data);
			return this;
		},
		unshiftRow: function(data) {
			this.insertRow(0, data);
			return this;
		},
		insertRow: function(index, data) {
			var me = this;
			var cols = _cols[this.id];
			var total = _data[this.id].length;
			if (index != 0 && index != -1) {
				if (index >= total) index = -1;
				if (index < -total) index = 0
			};
			if (index == 0 || index == -1) {
				var fun = function(data) {
					if (index == 0) {
						var pend = 'prepend'
					} else {
						var pend = 'append'
					}
					_data[me.id][index == 0 ? 'unshift' : 'push'](data);
					_tbodyObj[me.id].left[pend](createRow(me.id, cols.left, data));
					_tbodyObj[me.id].main[pend](createRow(me.id, cols.main, data));
					_tbodyObj[me.id].right[pend](createRow(me.id, cols.right, data))
				}
			} else {
				var fun = function(data, index) {
					if (index < 0) index++;
					_data[me.id].splice(index, 0, data);
					var leftTr = _tbodyObj[me.id].left.find('tr').eq(index);
					leftTr.before(createRow(me.id, cols.left, data));
					var centerTr = _tbodyObj[me.id].main.find('tr').eq(index);
					centerTr.before(createRow(me.id, cols.main, data));
					var rightTr = _tbodyObj[me.id].right.find('tr').eq(index);
					rightTr.before(createRow(me.id, cols.right, data))
				}
			};
			if (index == -1) {
				for (let i = 0, len = data.length; i < len; i++) {
					fun(data[i])
				}
			} else {
				for (let i = data.length - 1; i >= 0; i--) {
					fun(data[i], index)
				}
			}
			updateRowIndex(me);
			initRowHeight(me);
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
				this.box.find('.d-grid-bd tr').remove();
				_data[this.id] = [];
				this.resize()
			} else if (typeof index == 'number' || typeof index == 'string') {
				index = parseInt(index);
				var total = _data[this.id].length;
				if (index < -total || index >= total) return false;
				_data[this.id].splice(index, 1);
				_tbodyObj[me.id].left.find('tr').eq(index).remove();
				_tbodyObj[me.id].main.find('tr').eq(index).remove();
				_tbodyObj[me.id].right.find('tr').eq(index).remove();
				updateRowIndex(me);
				this.resize()
			} else if (typeof index == 'object') {
				index = index.sort(function(a, b) {
					return b - a
				});
				for (let i in index) {
					me.deleteRows(index[i])
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
			if (index == 'all') {
				var $trs = this.box.find('.d-grid-bd tr');
				switchSelectState($trs, 'on');
			} else {
				if (typeof index == 'number' || typeof index == 'string') {
					index = (index + '').split(',');
				}

				for (let i in index) {
					index[i] = parseInt(index[i]);
					var $temp = this.box.find('.d-grid-bd tr:nth-child(' + (index[i]+1) + ')');
					switchSelectState($temp, 'on');
				}
			}
			opt.rowOnSelect(this.getData(index));
			return this;
		},
		unselectRows: function(index) {
			var me = this;
			if (index == 'all') {
				var $trs = this.box.find('.d-grid-bd tr');
				switchSelectState($trs, 'off');
			} else {
				if (typeof index == 'number' || typeof index == 'string') {
					index = (index + '').split(',');
				}

				for (let i in index) {
					index[i] = parseInt(index[i]);
					var $temp = this.box.find('.d-grid-bd tr:nth-child(' + (index[i]+1) + ')');
					switchSelectState($temp, 'off');
				}
			}
			return this;
		},
		getCrtRowsIndex: function() {
			var arr = [];
			this.box.find('.d-grid-main .d-grid-bd tr.z-crt').each(function() {
				arr.push(parseInt($(this).attr('index')))
			});
			return arr
		},
		getCrtRowsData: function() {
			var me = this;
			var arr = [];
			this.box.find('.d-grid-main .d-grid-bd tr.z-crt').each(function() {
				var index = parseInt($(this).attr('index'));
				arr.push(_data[me.id][index])
			});
			return arr
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
				for (let i in index) {
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