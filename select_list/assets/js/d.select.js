;(function($, w, d, undefined) {

	var _timer;

	var jsonExtend = function(de, json) {
		for (i in json) {
			de[i] = json[i]
		}
		return de
	};

	var initFrame = function() {
		var me = this;
		var opt = me.opt;

		me.obj = $([
			'<dl class="d-select '+(opt.disabled ? 'z-dis' : '')+'">',
				'<dt class="d-select-hd" style="width:'+opt.width+';height:'+opt.height+'px;line-height:'+(opt.height-2)+'px;">',
					'<p>'+(opt.title)+'</p>',
					'<input type="hidden" name="'+opt.name+'">',
				'</dt>',
				'<dd class="d-select-bd" style="width:'+opt.width+';">',
					(opt.search
						? [
							'<form><div class="d-select-search">',
								'<input type="text" placeholder="搜索关键词">',
								'<button><i class="df df-select-search"></i></button>',
							'</div></form>'
						].join('')
						:''
					),

					'<div class="d-select-list">',
						'<ul style="max-height:'+opt.listHeight+'px"></ul>',
					'</div>',
				'</dd>',
			'</dl>'
		].join(''));

		me.box.html(me.obj);
	}

	var bindEvent = function() {
		var me = this;
		var opt = me.opt;
		var $obj = me.obj;
		var $dt = $obj.find('.d-select-hd');
		var $dd = $obj.find('.d-select-bd');

		$obj.click(function(e) {
			e.stopPropagation();
		});

		$dt.click(function() {
			if (me.isSpread) {
				me.fold();
			} else {
				me.spread();
			}
		});

		$(document).click(function() {
			me.fold();
		});

		if (opt.search) {
			var $form = $dd.find('form');
			var $ipt = $form.find('input');
			$form.submit(function() {
				typeof opt.search == 'function' ? opt.search($ipt.val()) : '';
				return false;
			});
		}
	}

	var initOption = function(id) {
		id += '';
		var me = this;
		var opt = me.opt;
		var $p = me.options[id].dom;
		if (opt.multiple) {
			$p.find('.d-select-option-name').prepend('<input class="d-select-option-chk" type="checkbox" />');
			$p.addClass('z-live').click(function() {
				if ($p.hasClass('z-crt')) {
					$p.removeClass('z-crt').find('.d-select-option-chk').attr('checked', false);
					me.crtIds.splice(me.crtIds.indexOf(id), 1);
					updateVal.call(me);
				} else {
					me.select(id);
				}
			});
		} else {
			$p.addClass('z-live').click(function() {
				me.select(id);
			});
		}
	}

	var updateVal = function() {
		var me = this;
		var $obj = me.obj;
		var $dt = $obj.find('.d-select-hd');
		var $dd = $obj.find('.d-select-bd');
		var crtName = [];
		var crtId = [];
		for (var i in me.choice) {
			if (me.crtIds.indexOf(me.choice[i]) != -1) {
				var optData = me.options[me.choice[i]];
				crtName.push(optData.name);
				crtId.push(optData.id);
			}
		}
		if (crtName.length > 0) {
			$dt.find('p').text(crtName.join(','));
			$dt.find('input').val(crtId.join(','));
		} else {
			me.reset();
		}

		if (crtId.length > 0 && crtId.length == me.choice.length) {
			$dd.find('.d-select-option-allchk').attr('checked', true).closest('p').addClass('z-crt');
		} else {
			$dd.find('.d-select-option-allchk').attr('checked', false).closest('p').removeClass('z-crt');
		}

	}

	var select = function(opt) {
		opt = jsonExtend({
			box: '',
			width: 220, // 宽
			height: 30, // 高
			listWidth: 'auto',
			listHeight: 200, // 下拉框列表最大高度
			deOption: true, // 是否有默认项
			deOptName: '请选择', // 默认项的内容
			deOptVal: '', // 默认项的值
			selOptVal: null, // 默认选中项的值
			title: '请选择', // 选择默认项或未选择的时候下拉框主体显示的内容
			name: '', // 用于表单提交时候的参数名
			multiple: false, // 是否支持多选
			checkAll: false, // 是否有全选项
			options: [], // 下拉列表数据
			disabled: false, // 是否禁用
			selectable: 1, // 多级时可选择的项，1（全部可选）| 2（分支最底级）
			search: false, // 是否支持搜索
			callback: function() {} // 选择时的回调函数
		}, opt || {});

		this.box = $(opt.box + ':first');

		if (this.box.length == 0) return this;

		this.opt = opt;
		this.disabled = opt.disabled ? true : false;

		opt.height = parseInt(opt.height) || 30;
		opt.width += '';
		if (opt.width.indexOf('%') > -1) {
			opt.width = parseInt(opt.width) + '%' || 220 + 'px';
		} else {
			opt.width = parseInt(opt.width) + 'px' || 220 + 'px';
		}

		initFrame.call(this);
		bindEvent.call(this);

		this.update(opt.options);
		this.select(opt.selOptVal);

		return this;
	};

	w.dSelect = select;

	select.prototype = {
		update: function(data) {
			this.reset();
			var me = this;
			var $obj = me.obj;
			var $ul = $obj.find('.d-select-list').children('ul').html('');

			this.options = {}; //选项数据
			this.choice = []; //下拉框的可选id
			this.crtIds = []; //下拉框已选择的id

			if (me.opt.multiple) {
				var $allChk = $('<li><p class="d-select-option z-default z-live"><span class="d-select-option-name" style="left:5px;"><input class="d-select-option-chk d-select-option-allchk" type="checkbox" />全选</span></p></li>').appendTo($ul);
				$allChk.find('p').click(function() {
					if ($(this).hasClass('z-crt')) {
						$(this).parent().nextAll('li').find('.d-select-option').removeClass('z-crt').find('.d-select-option-chk').attr('checked', false);
						me.crtIds = [];
					} else {
						$(this).parent().nextAll('li').find('.d-select-option').addClass('z-crt').find('.d-select-option-chk').attr('checked', true);
						me.crtIds = me.choice.join(',').split(',');
					}
					updateVal.call(me);
				});
			} else if (me.opt.deOption) {
				var $deOpt = $('<li><p class="d-select-option z-default z-live"><span class="d-select-option-name" style="left:5px;">'+me.opt.deOptName+'</span></p></li>').appendTo($ul);
				$deOpt.find('p').click(function() {
					me.reset();
					me.fold();
				});
			}

			var subIds = [];
			var dataArr = [];
			for (var i in data) {
				for (var j = parseInt(i)+1; j < data.length; j++) {
					if (data[i].pid == data[j].id) {
						data[j].sub = data[j].sub || [];
						data[j].sub.push(data[i]);
						subIds.push(data[i].id);
					} else if (data[i].id == data[j].pid) {
						data[i].sub = data[i].sub || [];
						data[i].sub.push(data[j]);
						subIds.push(data[j].id);
					}
				}
			}
			for (var i in data) {
				if (subIds.indexOf(data[i].id) == -1) {
					dataArr.push(data[i]);
				}
			}

			var fun = function($ul, data, level, space) {
				for (var i in data) {
					if (me.options[data[i].id]) continue;
					var $li = $([
						'<li><p class="d-select-option" title="'+data[i].name+'">',
							(function() {
								var str = '';
								for (var i=0; i<level; i++) {
									str += '<i class="d-select-line '+(space[i+1] == '1' ? 'z-null' : '')+'"></i>';
								}
								return str;
							})(),
							'<span class="d-select-option-name" style="left:'+(level*18 + 5)+'px;"></span>',
						'</p></li>'
					].join('')).appendTo($ul);
					$li.find('span').html(data[i].name);
					if (level > 0) {
						$li.find('i:last').addClass('z-sub');
					}
					if (i == data.length-1) {
						$li.find('i:last').addClass('z-last');
					}
					if (me.opt.selectable == '1' || (me.opt.selectable == '2' && !data[i].sub)) {
						me.options[data[i].id] = {
							dom: $li.find('p'),
							name: data[i].name,
							data: data[i].data,
							id: data[i].id
						}
						me.choice.push(data[i].id + '');
						initOption.call(me, data[i].id);
					}
					if (data[i].sub) {
						$li.find('span').addClass('z-prt');
						var $subUl = $('<ul></ul>').appendTo($li);
						var a = space.length == 0 ? [] : space.join(',').split(',');
						a.push(i == data.length-1 ? '1' : '0');
						fun($subUl, data[i].sub, level+1, a);
					}
				}
			}
			fun($ul, dataArr, 0, []);
		},

		reset: function() {
			var me = this;
			var $obj = this.obj;
			var $dt = $obj.find('.d-select-hd');
			var $dd = $obj.find('.d-select-bd');
			$dt.find('p').text(me.opt.title);
			$dt.find('input').val(me.opt.deOptVal);
			$dd.find('.d-select-option.z-crt').removeClass('z-crt').find('.d-select-option-chk').attr('checked', false);
			this.crtIds = [];
		},

		select: function(id) {
			var me = this;
			if (me.opt.multiple) {
				if (typeof id == 'number' || typeof id == 'string') {
					id = (id+'').split(',');
				}
				for (var i in id) {
					id[i] += '';
					if (this.choice.indexOf(id[i]) == -1) continue;
					me.options[id[i]].dom.addClass('z-crt').find('.d-select-option-chk').attr('checked', true);
					this.crtIds.push(id[i]);
				}

				updateVal.call(this);
			} else {
				var $obj = this.obj;
				var $dt = $obj.find('.d-select-hd');
				var $dd = $obj.find('.d-select-bd');
				id += '';
				if (this.choice.indexOf(id) == -1) return;
				var optData = me.options[id];
				if (!optData) return;
				var $p = optData.dom;
				$dd.find('.z-crt').removeClass('z-crt');
				$p.addClass('z-crt');

				$dt.find('p').text(optData.name);
				$dt.find('input').val(optData.id);

				me.fold();
				me.opt.callback(optData.id, optData.name, optData.data);
			}
		},

		disable: function() {
			this.disabled = true;
			this.obj.addClass('z-dis');
		},

		enable: function() {
			this.disabled = false;
			this.obj.removeClass('z-dis');
		},

		spread: function() {
			if (this.disabled) return;
			this.isSpread = true;
			var opt = this.opt;
			var $obj = this.obj;
			var $dt = $obj.find('.d-select-hd');
			var $dd = $obj.find('.d-select-bd');
			$dd.show();

			clearTimeout(_timer);
			function fun() {
				$dd.css({
					left: $dt[0].getBoundingClientRect().left,
					top: $dt[0].getBoundingClientRect().top + opt.height
				});
				_timer = setTimeout(function() {
					fun();
				}, 10);
			}
			fun();
		},

		fold: function() {
			this.isSpread = false;
			var $obj = this.obj;
			var $dd = $obj.find('.d-select-bd');
			$dd.hide();
			clearTimeout(_timer);
		}
	}
})(jQuery, window, document);