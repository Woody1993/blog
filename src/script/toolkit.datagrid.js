/**
 * Version: 2.0.0
 * Author: Woody
 * Description: 功能大纲：
 * 				创建时可省略new操作符 √
 * 				重构表格布局逻辑 √
 * 				优化滚动联动交互 √
 * 				优化自适应方法 √
 * 				重构表格行操作方法 √
 * 					├ 插入行  insertRows √
 * 					└ ┐ 获取所有行  getAllRows √
 * 					  │ 根据序号获得行  getRows √
 * 					  │ 获得当前页选中行  getCrtRows √
 * 					  └ 通过条件获取行  getRowsFrom √
 * 					  	├ 移动至指定位置  moveTo √
 * 						├ 删除  remove √
 * 						├ 获取序号  getIndex √
 * 						├ 获取数据  getData √
 * 						├ 选中  select √
 * 						├ 取消选中  unselect √
 * 						├ 刷新数据  update √
 * 						├ 隐藏  hide √
 * 						├ 显示  show √
 * 						├ 遍历  each √
 * 						└ 获取指定序号行  eq √
 * 				优化排序及配置 √
 * 				优化汇总行及配置 √
 * 				系统列
 * 					├ 序号列 √
 * 					├ 子表格列  [3]
 * 					└ 多级列  [3]
 * 				子表格（通过子表格列展开）  [3]
 * 				多级表格（通过多级列展开）  [3]
 * 				列宽拖拽调整 √
 * 				整列隐藏  [5]
 * 				整列拖拽排序  [5]
 * 				保存表格已选行数据，并在表格刷新（搜索、跳页等情况）时回填已选状态，提供方法
 * 					├ 获取所有数据  getData √
 * 					├ 获取已选数据  getCrtData √
 * 					└ 清除已选数据  clearCrtData √
 *              表格搜索功能  [4]
 *              快捷键 √
 * 					├ up  选中上一行 √
 * 					├ down  选中下一行 √
 * 					├ pageup  上一页 √
 * 					└ pagedown  下一页 √
 * Date: 2018-11-01
**/

define([
	'jquery',
	'tools',
	'datagrid_css',
    'form',
    'pagination',
    'shortcuts'
], function($, tools, form, pagination, shortcuts) {
	var _scrollSize = (function() {  // 浏览器滚动条大小
		var noScroll, scroll, oDiv = document.createElement('div');
		oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;';
		noScroll = document.body.appendChild(oDiv).clientWidth;
		oDiv.style.overflowY = 'scroll';
		scroll = oDiv.clientWidth;
		document.body.removeChild(oDiv);
		return (noScroll - scroll);
	})();

	var _eventType = ['click', 'focus', 'blur', 'change'];  // 支持的文本框事件

	var _sysColName = ['__$tr', '__index', '__selected', '__hide'];  // 行数据保留字段

	var getData = function(grid, page, fun) {
		var param = {};
		var dataFrom = grid.opt.dataFrom, pageBar = grid.pageBar;
        param = typeof dataFrom.data == 'function' ? dataFrom.data() : dataFrom.data || {};
        if (pageBar) {
            param[pageBar.pageIndexParam] = page || 1;
            param[pageBar.pageSizeParam] = pageBar.pageSize;
        }
		if (grid.sortBy) {
			var sortBy = grid.sortBy.split(',');
			param.sort = sortBy[0];
			param.sortBy = sortBy[1]
        }
        grid.ajaxObj && grid.ajaxObj.abort();
		grid.ajaxObj = $.ajax({
			url: dataFrom.url,
			type: dataFrom.method,
			data: param,
			dataType: dataFrom.dataType,
			success: function(msg) {
				if (typeof msg == 'string') {
					msg = (new Function("return " + msg))();
				}
                if (pageBar) {
                    var total = dataFrom.totalFormatter.call(grid, msg);
                    grid.pageCount = Math.ceil(total / pageBar.pageSize);
                }
				fun(
					dataFrom.dataFormatter.call(grid, msg),
					dataFrom.countFormatter.call(grid, msg),
					total
				);
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
        
        var mainWidth = 0;

		if (opt.check) {
			if (opt.check.callType != 2) {
                if (opt.check.multiple && opt.check.checkAll) {
                    grid.allChk = form.createCheck({
                        type: 'checkbox',
                        callback: function(checked) {
                            if (checked) {
                                grid.getAllRows().select();
                            } else {
                                grid.getAllRows().unselect();
                            }
                        }
                    });
                }
				opt.colModel.unshift({
                    sys: 'selected',
					width: 35,
					title: grid.allChk && grid.allChk.obj,
					frozen: 'left',
					align: 'center',
					dataFormatter: function(data, rh) {
                        return form.createCheck({
                            type: 'checkbox',
                            checked: !!data,
                            callback: function(checked, stop) {
                                stop();
                                if (data) rh.unselect();
                                else rh.select();
                                return false;
                            }
                        }).obj;
					}
				})
			}
        };
        
        function colFmt(col) {
            col = $.extend({
                title: '',
                name: '',
                width: 100,
                frozen: 'none',
                align: 'left',
                overflow: true,
                editable: false,
                iptClassName: '',
                dataFormatter: function(value) {
                    return value;
                },
                titleFormatter: function(value) {
                    return value;
                },
                count: false,
                sort: false,
                dom: []
            }, col);

            if (col.sys) col.name = '__' + col.sys;

            if (col.count) {
                opt.countBar = true;
                col.count = $.extend({
                    mode: 'number',  // number || type
                    itemFormatter: function(value) {
                        return value;
                    },
                    totalFormatter: function(value) {
                        return value;
                    }
                }, tools.typeof(col.count) == 'object' ? col.count : {});
            }

            if (col.sort) {
                col.sort = $.extend({
                    type: 'desc,asc',  // desc,asc || asc,desc || desc || asc
                    param: col.name
                }, tools.typeof(col.sort) == 'object' ? col.sort : {});
            }

            if (col.editable) {
                col.editable = $.extend({
                    className: '',
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
                }, tools.typeof(col.editable) == 'object' ? col.editable : {});
            }

            col.width = parseInt(col.width) || 100;

            return col;
        };

		var leftSpaceObj, rightSpaceObj;
		!function poll(cols, parentFrozen) {
			for (var i in cols) {
				if (cols[i].subCol) {
					cols[i] = $.extend({
						title: '',
						align: 'center',
						frozen: 'none'
					}, cols[i]);
					poll(cols[i].subCol, cols[i].frozen);
				} else {
					cols[i] = colFmt(cols[i]);
                    
                    if (parentFrozen) cols[i].frozen = parentFrozen;

                    if (cols[i].frozen == 'left' && !leftSpaceObj)  {
                        leftSpaceObj = colFmt({
                            updateWidth: function() {
                                var w = -15;  // 单元格左右内边距 + 一倍边框宽度
                                json.left.forEach(function(item) {
                                    w += item.width + 15;
                                });
                                this.width = w;
                                this.dom.length && $(this.dom).width(w);
                                return this;
                            }
                        });
                    } else if (cols[i].frozen == 'right' && !rightSpaceObj) {
                        rightSpaceObj = colFmt({
                            updateWidth: function() {
                                var w = -16;  // 单元格左右内边距 + 两倍边框宽度
                                json.right.forEach(function(item) {
                                    w += item.width + 15;
                                });
                                this.width = w;
                                this.dom.length && $(this.dom).width(w);
                                return this;
                            }
                        });
                    }

                    mainWidth += cols[i].width + 15;
                    grid.mainWidth = mainWidth;

					json[cols[i].frozen == 'none' ? 'main' : cols[i].frozen].push(cols[i]);
				}
			}
        }(opt.colModel);

        leftSpaceObj && (
            leftSpaceObj.updateWidth(),
            json.main.unshift(leftSpaceObj),
            opt.colModel.unshift(leftSpaceObj)
        );
        rightSpaceObj && (
            rightSpaceObj.updateWidth(),
            json.main.push(rightSpaceObj),
            opt.colModel.push(rightSpaceObj),
            grid.frozenRight = true
        );

		return json
	};

	var initFrame = function(grid) {
		var opt = grid.opt;

        grid.root = {dom: $('<div class="d-grid"></div>')};
        
		grid.root.head = {dom: $('<div class="d-grid-head"></div>').appendTo(grid.root.dom)};
		grid.root.head.main = {dom: $('<div class="d-main flex"></div>').appendTo(grid.root.head.dom)};
		grid.root.head.left = {dom: $('<div class="d-froze-left"></div>').appendTo(grid.root.head.main.dom)};
        grid.root.head.right = {dom: $('<div class="d-froze-right"></div>').appendTo(grid.root.head.main.dom)};
        
		grid.root.body = {dom: $('<div class="d-grid-body"></div>').appendTo(grid.root.dom)};
		grid.root.body.main = {dom: $('<div class="d-main flex"></div>').appendTo(grid.root.body.dom)};
		grid.root.body.left = {dom: $('<div class="d-froze-left">').appendTo(grid.root.body.main.dom)};
		grid.root.body.right = {dom: $('<div class="d-froze-right">').appendTo(grid.root.body.main.dom)};

		if (grid.opt.countBar) {
			grid.root.foot = {dom: $('<div class="d-grid-foot"></div>').appendTo(grid.root.dom)};
			grid.root.foot.main = {dom: $('<div class="d-main flex"></div>').appendTo(grid.root.foot.dom)};
			grid.root.foot.left = {dom: $('<div class="d-froze-left"></div>').appendTo(grid.root.foot.main.dom)};
			grid.root.foot.right = {dom: $('<div class="d-froze-right"></div>').appendTo(grid.root.foot.main.dom)};
            
            grid.root.foot.main.table = {dom: $('<table><tbody></tbody></table>').prependTo(grid.root.foot.main.dom)};
            grid.root.foot.left.table = {dom: $('<table><tbody></tbody></table>').prependTo(grid.root.foot.left.dom)};
            grid.root.foot.right.table = {dom: $('<table><tbody></tbody></table>').prependTo(grid.root.foot.right.dom)};
        };

		if (opt.pageBar) {
			grid.root.page = {dom: $('<div class="d-grid-page"></div>').appendTo(grid.root.dom)};
		}

		var $headObjs = createThead.call(grid, grid.opt.colModel);
		grid.root.head.main.dom.prepend($headObjs[0]);
		grid.root.head.left.dom.prepend($headObjs[1]);
		grid.root.head.right.dom.prepend($headObjs[2]);

		grid.root.body.main.table = {dom: $('<table><tbody></tbody></table>').prependTo(grid.root.body.main.dom)};
		grid.root.body.left.table = {dom: $('<table><tbody></tbody></table>').prependTo(grid.root.body.left.dom)};
		grid.root.body.right.table = {dom: $('<table><tbody></tbody></table>').prependTo(grid.root.body.right.dom)};

        if (grid.frozenRight) {
            grid.root.head.main.dom.addClass('has-right');
            grid.root.body.main.dom.addClass('has-right');
            if (grid.pageCount) {
                grid.root.foot.main.dom.addClass('has-right');
            }
        }

		grid.box.html(grid.root.dom);
	};

	var createThead = function(cols) {
		var grid = this;
		var $hds = [$('<thead>'), $('<thead>'), $('<thead>')];

		// 设置排序按钮
		var setSort = function($th, col) {
			if (col.sort) {
				$th.addClass('d-grid-sort-th').append('<i class="df df-sort"></i><i class="df df-sort-desc"></i><i class="df df-sort-asc"></i>').click(function() {
					var sortType = col.sort.type.split(',');
					var sortParam = col.sort.param;
					if ($(this).hasClass('z-sort-desc')) {
						if (sortType.indexOf('asc') > -1) {
							$(grid.root.head.dom).find('.d-grid-sort-th').removeClass('z-sort-desc z-sort-asc');
							$(this).removeClass('z-sort-desc').addClass('z-sort-asc');
							grid.sortBy = sortParam + ',asc'
						}
					} else if ($(this).hasClass('z-sort-asc')) {
						if (sortType.indexOf('desc') > -1) {
							$(grid.root.head.dom).find('.d-grid-sort-th').removeClass('z-sort-desc z-sort-asc');
							$(this).removeClass('z-sort-asc').addClass('z-sort-desc');
							grid.sortBy = sortParam + ',desc'
						}
					} else {
						$(grid.root.head.dom).find('.d-grid-sort-th').removeClass('z-sort-desc z-sort-asc');
						$(this).addClass('z-sort-' + sortType[0]);
						grid.sortBy = sortParam + ',' + sortType[0]
					}
					grid.update(1)
				});
			}
			return $th
		};
		
		// 设置拖拽
		var setDraw = function($th, col) {
            col.dom.push($th.find('.th')[0]);

            if (col.sys == 'space') return;
            
            col.initWidth = col.width;
			$('<div class="d-draw"></div>').appendTo($th).mousedown(function(e) {
				if (e.button == 0) {
                    $(grid.root.head.dom).addClass('z-draw');
					var move, sx = e.clientX, width;
					$(document).mouseup(function(e) {
                        $(grid.root.head.dom).removeClass('z-draw');
                        col.width = width;

                        if (col.frozen == 'right') {
                            cols[cols.length-1].updateWidth();
                        } else if (col.frozen == 'left') {
                            cols[0].updateWidth();
                        }

                        grid.resize();

						$(this).unbind(move);
						$(this).unbind(e);
					}).mousemove(function(e) {
                        move = e;
                        if (col.frozen == 'right') {
                            width = col.width - e.clientX + sx;
                        } else {
                            width = col.width + e.clientX - sx;
                        }
                        width = width < 20 ? 20 : width;
                        $(col.dom).width(width);
					});
				}
			}).dblclick(function() {
                col.width = col.initWidth;
                $(col.dom).width(col.width);

                if (col.frozen == 'right') {
                    cols[cols.length-1].updateWidth();
                } else if (col.frozen == 'left') {
                    cols[0].updateWidth();
                }
            });
		};

		// 获取跨列数
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

		// 获取json深度
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

		!function poll(cols) {
			var $trs = [$('<tr>'), $('<tr>'), $('<tr>')];
			var subCol = [];
			var maxDepth = 0;
			for (var i in cols) {
				maxDepth = maxDepth > cols[i].depth ? maxDepth : cols[i].depth
			};
			for (var i = 0, len = cols.length; i < len; i++) {
				if (cols[i].subCol) {
					var $th = $('<th colspan="' + cols[i].colspan + '" rowspan="1"><div class="th" style="text-align:' + cols[i].align + ';"></div></th>');
					$th.find('.th').html(cols[i].title);
					for (var j in cols[i].subCol) {
						subCol.push(cols[i].subCol[j])
					}
				} else {
					var rowspan = maxDepth - cols[i].depth + 1;
					var $th = $('<th colspan="1" rowspan="' + (maxDepth - cols[i].depth + 1) + '"><div class="th" style="width:' + cols[i].width + 'px;height:' + (rowspan * 35 + rowspan - 1) + 'px;line-height:' + (rowspan * 35 + rowspan - 1) + 'px;text-align:' + cols[i].align + ';"></div></th>');
					$th.find('.th').html(cols[i].title);
					cols[i].sort && setSort($th.find('.th'), cols[i]);
					setDraw($th, cols[i]);
				};

				var frozen = cols[i].frozen;
				$trs[frozen == 'left' ? 1 : (frozen == 'right' ? 2 : 0)].append($th)
			};
			for (var i=0; i<3; i++) {
				if ($trs[i].find('th').length > 0) $hds[i].append($trs[i]);
			}
			if (subCol.length > 0) poll(subCol)
		}(cols);

		return [
			$('<table>').html($hds[0]),
			$('<table>').html($hds[1]),
			$('<table>').html($hds[2])
		]
	};

	var createRow = function(grid, cols, data) {
		var opt = grid.opt;
		var $tr = $('<tr>');
		var rh = new rowsHandle(grid, [data]);

		var insertTd = function(col) {
			var name = col.name;

			var $td = $('<td><div class="td" style="width:' + col.width + 'px;text-align:' + col.align + '">');

			col.dom.push($td.find('.td')[0]);

			if (col.editable) {
				var $ipt = $('<input class="d-grid-ipt" type="text" />').addClass(col.editable.className);
				$td.children('div').html($ipt);
				for (var i in _eventType) {
					var eFun = col.editable[_eventType[i]];
					if (typeof eFun == 'function') {
						$ipt[_eventType[i]](eFun);
					}
				}
				$ipt.keyup(function() {
					data[name] = $(this).val();
				});
			};
			if (col.overflow) {
				$td.find('.td').addClass('z-hide-txt');
			}
			$tr.append($td);

			function setVal(v) {
				if (v !== undefined && col.titleFormatter) {
					var title = tools.typeof(col.titleFormatter) == 'function' ? col.titleFormatter.call(grid, v) : v;
					tools.typeof(title) == 'string' && (title = title.replace(/<\/?[^>]*>/g, ''));
					$td.attr('title', title);
				}

				if (col.editable) {
					$td.children('div').children('input').val(col.dataFormatter.call(grid, v, rh));
				} else {
					$td.children('div').html(col.dataFormatter.call(grid, v, rh));
				};
			}

            // 如果使用了数据则进行双向绑定
			if (name) {
                data[name] = data[name] !== undefined ? data[name] : '';
				Object.defineProperty(data, name, (function(v) {
                    setVal(v);

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
			} else {
				setVal();
			}
		};
		for (var i = 0, len = cols.length; i < len; i++) {
			insertTd(cols[i]);
		};

		$tr.click(function() {
			if ((!opt.event.click || opt.event.click.call(grid, rh) !== false) && opt.check && opt.check.callType != 1) {
				if (rh.isSelected()) {
					rh.unselect();
				} else {
					rh.select();
				}
			}
		});

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

	var createCount = function(cols, data, countData) {
		var $tr = $('<tr>');
		var insertTd = function(col) {
			var $td = $('<td><div class="td" style="width:' + col.width + 'px">');
			col.dom.push($td.find('.td')[0]);
			if (col.count) {
				var count = (function(name) {
						switch (col.count.mode) {
						case 'number':
							var count = 0;
							for (var j in data) {
								count += col.count.itemFormatter(data[j][name]);
							}
							return count;
						case 'type':
							var count = {};
							for (var j in data) {
								var val = col.count.itemFormatter(data[j][name]);
								count[val] = count[val] || 0;
								count[val]++;
							}
							return count;
						}
					})(col.name);
				var html = col.count.totalFormatter(count, countData && countData[col.name]);
				tools.typeof(html) == 'array' && (html = html.join('</br>'));
				$td.find('div').html(html);
			}
			$tr.append($td)
		}.bind(this);
		for (var i = 0, len = cols.length; i < len; i++) {
			insertTd(cols[i])
		}
		return $tr;
	};

	var initRowHeight = function(count) {
        if (count) {
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
        } else {
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
        }

		this.resize()
	};

	var updateRowIndex = function() {
		for (var i in this.data) {
			this.data[i].__index = parseInt(i) + 1;
		}
	};

	var scrollEvent = function() {
		var grid = this;
		this.root.body.main.dom.scroll(function() {
			var sl = $(this).scrollLeft();
			var st = $(this).scrollTop();
			grid.root.head.main.dom[0].scrollLeft = sl;
            if (grid.opt.countBar) {
                grid.root.foot.main.dom[0].scrollLeft = sl;
            }

			grid.root.body.left.dom[0].scrollTop = st;
			grid.root.body.right.dom[0].scrollTop = st;
			frozeShadow.call(grid);
		});

		grid.root.body.left.dom.on('mousewheel DOMMouseScroll', onMouseScroll);
		grid.root.body.right.dom.on('mousewheel DOMMouseScroll', onMouseScroll);
		var timer, init, cum, dir;
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
			}, 100);
			e.preventDefault();
		}
	};

	var frozeShadow = tools.throttle(function () {
		var sl = this.root.body.main.dom.scrollLeft();
        var maxSl = this.mainWidth
                    - this.root.body.main.dom.width()
					+ this.sw - 1;

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
	}, 300);
	
	var main = function(opt) {
		return new main.fn.init(opt);
	};

	main.fn = main.prototype = {
		init: function(opt) {
			opt = $.extend({
				box: 'body',
				width: '100%',
				height: function() {
                    return this.box.height();
                },
				event: {},
				colModel: [],
				check: false,
                pageBar: false,
                immediate: true,
                shortcuts: []
			}, opt || {});

			opt.dataFrom = $.extend({
				type: 'ajax',
				url: '',
				method: 'post',
				data: '',
				dataType: 'json',
				dataFormatter: function(data) {
					if (opt.pageBar) {
						return data.data;
					} else {
						return data;
					}
				},
				countFormatter: function(data) {
					return data.count;
				},
				totalFormatter: function(data) {
					return data.total;
				}
			}, opt.dataFrom || {});

			if (opt.check) {
				opt.check = $.extend({
					multiple: false,
					checkAll: false,
					callType: 0  // 0: 通过点击复选框或点击行；1：通过点击复选框；2：通过点击行；
				}, tools.typeof(opt.check) == 'object' ? opt.check : {});
			}

			this.opt = opt;
			this.box = $(opt.box).eq(0).css('overflow', 'hidden');
			this.width = opt.width;
			this.height = opt.height;
			this.colsModel = getColGroup(this);
			this.data = [];
            this.crtData = {
                key: opt.dataFrom.idKey,
                data: [],
                index: []
            };
			initFrame(this);
			scrollEvent.call(this);

			if (opt.pageBar) {
                this.pageBar = $.extend({
                    pageSize: 20,
                    pageIndexParam: 'pageIndex',
                    pageSizeParam: 'pageSize'
                }, typeof opt.pageBar == 'object' ? opt.pageBar : {});
                
                this.pageBar.obj = pagination({
                    box: this.root.page.dom,
                    pageSize: this.pageBar.pageSize,
                    immediate: false,
                    callback: function(num) {
                        this.redrawing(num);
                    }.bind(this)
                });
            };

			this.resize();
            opt.immediate && this.update(1);

            focusGrid = this;
			return this
		},

		redrawing: function(page) {
			var me = this;
			var opt = this.opt;
			this.data = [];
			this.root.body.main.table.dom.html('');
			this.root.body.left.table.dom.html('');
			this.root.body.right.table.dom.html('');
            this.allChk && this.allChk.check(false);

            if (!this.crtData.key) {
                this.clearCrtData();
            }

			var create = function (data, countData, total) {
				me.pushRows(data);

				if (opt.countBar) {
					this.root.foot.main.table.dom.html(createCount.call(me, this.colsModel.main, data, countData));
					this.root.foot.left.table.dom.html(createCount.call(me, this.colsModel.left, data, countData));
					this.root.foot.right.table.dom.html(createCount.call(me, this.colsModel.right, data, countData));
					initRowHeight.call(me, true)
				};

				if (this.pageBar) {
                    this.pageBar.obj.setTotal(total);
				};
	
				if ((typeof this.height == 'function' ? this.height() : this.height) == 'auto') {
					this.resize();
                }
                
                opt.event.afterUpdate && opt.event.afterUpdate.call(me);
			}.bind(this);

			if (opt.dataFrom.type == 'ajax') {
				getData(me, page, create);
			} else if (opt.dataFrom.type == 'local') {
				create(opt.dataFrom.data);
			}
			return this;
		},

		resize: function() {
			var $box = this.box;
			var width = typeof this.width == 'function' ? this.width() : (typeof this.width == 'string' && this.width.indexOf('%') >= 0) ? $box.width() * (parseFloat(this.width) || 100) / 100 : parseInt(this.width);
            var height =  typeof this.height == 'function' ? this.height() : this.height;

			this.root.dom.width(width - 2);

			this.sw = this.sh = 0;
			if (height == 'auto') {
				this.root.dom.height('auto');
				this.root.body.dom.height('auto');

				if (this.mainWidth > this.root.body.main.dom.width()) {
					this.sh = _scrollSize;
				}
			} else {
                height = parseInt(height);
				var h = height - this.root.head.dom.height() - 2 - (this.opt.countBar ? this.root.foot.dom.height() : 0) - (this.opt.pageBar ? this.root.page.dom.height() + 1 : 0);
				this.root.dom.height(height - 2);
				this.root.body.dom.height(h);

				if (this.root.body.main.table.dom.height() > this.root.body.main.dom.height()) {
					this.sw = _scrollSize;
				}

				if (this.mainWidth + this.sw > this.root.body.main.dom.width()) {
                    this.sh = _scrollSize;
                    this.root.head.main.dom.addClass('scroll-x');
                    this.root.body.main.dom.addClass('scroll-x');
                    if (this.opt.countBar) {
                        this.root.foot.main.dom.addClass('scroll-x');
                    }
                    this.root.body.main.dom.scroll();

					if (this.root.body.main.table.dom.height() + this.sh > this.root.body.main.dom.height()) {
						this.sw = _scrollSize;
					}
				} else {
                    this.root.head.main.dom.removeClass('scroll-x');
                    this.root.body.main.dom.removeClass('scroll-x');
                    if (this.opt.countBar) {
                        this.root.foot.main.dom.removeClass('scroll-x');
                    }
                }
            }

            this.root.head.right.dom.css('padding-right', this.sh ? this.sw : 0);
            if (this.opt.countBar) {
                this.root.foot.right.dom.css('padding-right', this.sh ? this.sw : 0);
            }

			this.root.body.left.dom.css('bottom', this.sh);
			this.root.body.right.dom.css('bottom', this.sh);
			this.root.body.right.dom.css('right', this.sw);
			frozeShadow.call(this);
			return this;
        },
        
		// 刷新表格指定页数
        update: function(page) {
			var maxnum = this.pageCount || 1;
			page = page || this.nowPage;
			page = page > maxnum ? maxnum : page;
            this.nowPage = page;
            if (this.pageBar) {
                this.pageBar.obj.jump(page);
            } else {
                this.redrawing(page);
            }
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
                this.data = this.data.concat(data);
				var fun = function(data) {
					this.root.body.main.table.dom.append(createRow(this, this.colsModel.main, data));
					this.root.body.left.table.dom.append(createRow(this, this.colsModel.left, data));
					this.root.body.right.table.dom.append(createRow(this, this.colsModel.right, data));
				}.bind(this);
			} else {
                index = index < 0 ? total + 1 + index : index;
				var $trs = this.data[index].__$tr;
                this.data.splice.apply(this.data, [index, 0].concat(data));
				var fun = function(data) {
					$($trs[0]).before(createRow(this, this.colsModel.main, data));
					$($trs[1]).before(createRow(this, this.colsModel.left, data));
					$($trs[2]).before(createRow(this, this.colsModel.right, data));
				}.bind(this);
			};

			updateRowIndex.call(me);

			data.forEach(function(item) {
				fun(item);
            });
            
			initRowHeight.call(me);

			if (me.crtData.key) {
				var index = [];
				data.forEach(function(item) {
					if (me.crtData.index.indexOf(item[me.crtData.key]) > -1) {
						index.push(item.__index - 1);
					}
                });
				me.getRows(index).select();
			}

			var $imgs = this.root.body.dom.find('img');
			if ($imgs.length > 0) {
				$imgs.load(function() {
					initRowHeight.call(me);
				});
			}
			return this;
		},
		
		// 根据序号获取行
		getRows: function(index) {
			if (tools.typeof(index) == 'number' || tools.typeof(index) == 'string') index = [index];
			else if(tools.typeof(index) != 'array') return;

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
		getRowsFrom: function(fun) {
            var data = [];
            this.data.forEach(function(item) {
                if (!!fun(item)) {
                    data.push(item)
                }
            });
			return new rowsHandle(this, data);
        },
        
        getData() {
            return this.getAllRows().getData();
        },

		// 获取数据
		getCrtData: function() {
			return this.crtData.data;
		},

		// 清除已选数据
		clearCrtData: function() {
            this.crtData.data = [];
            this.crtData.index = [];
			this.getCrtRows().unselect();
			return this;
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

	var clearRowsData = function(data) {
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
			var total = this.grid.data.length - this.length;
			if (index >= total) index = -1;
			else if (index < -total) index = 0;

			var data = [];
			for (var i = this.length-1; i>=0; i--) {
				data.unshift(this.grid.data.splice(this.rows[i].__index-1, 1)[0]);
			}

			if (total == 0 || index == -1) {
				var fun = function(data) {
					this.data.push(data);
					this.root.body.main.table.dom.append(data.__$tr[0]);
					this.root.body.left.table.dom.append(data.__$tr[1]);
					this.root.body.right.table.dom.append(data.__$tr[2]);
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
			updateRowIndex.call(this.grid);
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

		getIndex: function(shift) {
			var data = [];
			for (var i in this.rows) {
				data.push(this.rows[i].__index - 1 + (shift || 0));
			}
			return data;
		},

		getData: function() {
			var data = [];
			for (var i in this.rows) {
				data.push(clearRowsData(this.rows[i]));
			}
			return data;
        },

        prev: function() {
            return this.grid.getRows(this.getIndex(-1));
        },

        next: function() {
            return this.grid.getRows(this.getIndex(1));
        },
        
        click: function() {
            if (!this.length) return;
            var grid = this.grid;
            grid.opt.event.click && grid.opt.event.click.call(grid, this);
        },

		select: function() {
            var grid = this.grid;
            var focusRow;
			this.each(function() {
				if ($(this.rows[0].__$tr).hasClass('z-crt')) return;

				if (grid.opt.event.beforeSelect && grid.opt.event.beforeSelect.call(grid, this) === false) return;
				
				if (!grid.opt.check.multiple) {
					grid.getCrtRows().unselect();
				}

				$(this.rows[0].__$tr).addClass('z-crt');
				this.rows[0].__selected = true;

                var data = clearRowsData(this.getData()[0]),
                    index = grid.crtData.key ? data[grid.crtData.key] : this.getIndex()[0];
				if (index !== undefined && grid.crtData.index.indexOf(index) == -1) {
					grid.crtData.data.push(data);
					grid.crtData.index.push(index);
				}

                grid.opt.event.select && grid.opt.event.select.call(grid, this);
                
                !focusRow && (focusRow = this);
            });

            if (grid.allChk && grid.getCrtRows().length == grid.getAllRows().length) {
                grid.allChk.check(true);
            }
            
            if (focusRow) {
                var scrollTop = this.grid.root.body.main.dom[0].scrollTop,
                    boxHeight = $(this.grid.root.body.main.dom).height(),
                    offsetTop = this.rows[0].__$tr[0].offsetTop,
                    rowHeight = $(this.rows[0].__$tr[0]).innerHeight();

                if (offsetTop < scrollTop) {
                    $(this.grid.root.body.main.dom).scrollTop(offsetTop);
                } else if (offsetTop + rowHeight - scrollTop > boxHeight) {
                    $(this.grid.root.body.main.dom).scrollTop(offsetTop - (boxHeight - rowHeight) + this.grid.sh);
                }
            }
			return this;
		},

		unselect: function() {
			var grid = this.grid;
			this.each(function() {
				if (!$(this.rows[0].__$tr).hasClass('z-crt')) return;
				$(this.rows[0].__$tr).removeClass('z-crt');
				this.rows[0].__selected = false;

                var data = clearRowsData(this.getData()[0]),
                    index = grid.crtData.key ? data[grid.crtData.key] : this.getIndex()[0];
				if (grid.crtData.index.indexOf(index) > -1) {
					var index = grid.crtData.index.indexOf(index);
					grid.crtData.data.splice(index, 1);
					grid.crtData.index.splice(index, 1);
				}
            });
            grid.allChk && grid.allChk.check(false);
			return this;
        },
        
        isSelected: function() {
            var selected = true;
            this.each(function() {
                if (!this.rows[0].__selected) {
                    selected = false;
                    return false;
                }
            });
            return selected;
        },

		update: function(data) {
			tools.typeof(data) == 'object' && (data = [data]);
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

		show: function() {
			for (var i in this.rows) {
				var row = this.rows[i];
				row.__hide = false;
				$(row.__$tr).show();
			}
			return this;
		},

		hide: function() {
			for (var i in this.rows) {
				var row = this.rows[i];
				row.__hide = true;
				$(row.__$tr).hide();
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
        },
        
        find: function(selector) {
            var $tr = [];
            this.each(function() {
                $tr = $tr.concat([this.rows[0].__$tr[1], this.rows[0].__$tr[0], this.rows[0].__$tr[2]]);
            });
            return $($tr).find(selector);
        }
    };
    
    var focusGrid;
    shortcuts.listener(['up', 'down'], function(e) {
        if (!focusGrid || !focusGrid.opt.shortcuts.includes(e.key)) return;
        var crtRow = focusGrid.getCrtRows();
        var index = -1;

        if (crtRow.length) {
            index = e.key == 'up' ? crtRow.eq(0).getIndex()[0] : crtRow.eq(-1).getIndex()[0];
        }

        while(true) {
            e.key == 'up' ? --index : ++index;
            if (index < 0) {
                index = focusGrid.getAllRows().length - 1;
            } else if (index >= focusGrid.getAllRows().length) {
                index = 0;
            }
            var nextRow = focusGrid.getRows(index);
            if (nextRow.length) {
                focusGrid.clearCrtData();
                if (nextRow.select().isSelected()) {
                    break;
                }
            } else {
                break;
            }
        }
    }).listener(['pageup', 'pagedown'], function(e) {
        if (!focusGrid || !focusGrid.opt.shortcuts.includes(e.key)) return;
        focusGrid.update(focusGrid.nowPage + (e.key == 'pageup' ? -1 : 1));
    });

	return main;
});