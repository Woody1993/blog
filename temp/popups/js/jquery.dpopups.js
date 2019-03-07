;(function($, w, d, undefined) {
	/**
	 * 消息框方法
	 * @param  {json} opt 配置参数
	 * @return {obj}      返回提示框的jQuery对象
	 */
	dAlert = function(opt) {
		opt = jQuery.extend({
			msg: '',
			ico: false,
			timeout: 1500,
			callback: function() {}
		}, opt || {});

		$('.d-alert').remove();
	    var html = [
	    	'<div class="d-alert">',
	    		(opt.ico == false ? '' : '<i class="ico ico-'+ opt.ico +' df df-popup-'+ opt.ico +'"></i>'),
	    		'<p>'+opt.msg+'</p>',
	    	'</div>'
	    ];
	    var $alert = $(html.join(''));
	    $("body").append($alert);
	    $alert.fadeIn(300, function() {
	        setTimeout(function() {
	            $alert.close();
	            opt.callback();
	        }, opt.timeout);
	    }).css({
	        'margin-left': -$alert.innerWidth()/2,
	        'margin-top': -$alert.innerHeight()/2
	    }).click(function() {
	    	$(this).close();
	        opt.callback();
	    });;

	    return $alert;
	};

	/**
	 * 询问框方法
	 * @param  {json} opt 配置参数
	 * @return {obj}      返回询问框的jQuery对象
	 */
	dConfirm = function(opt) {
		opt = jQuery.extend({
			title: '提醒消息',
			msg: '',
			ico: 'inquire',
			btns: true,
			onOk: function() {},
			onCancel: function() {}
		}, opt || {});

		//生成询问框对象
		var $confirmBox = $('<div class="d-confirm-box d-shade"></div>');
		var $confirm = $('<div class="d-confirm d-anim"></div>');

		//生成询问框标题
		var ttHtml = [
			'<div class="confirm-tt">',
				opt.title,
			'</div>'
		];
		var $tt = $(ttHtml.join(''));

		//生成询问框主体
		var ctHtml = [
			'<div class="confirm-ct">',
				'<i class="ico df df-popup-'+opt.ico+'"></i>',
			'</div>'
		];
		var $ct = $(ctHtml.join(''));
		var $msg = $('<p>'+opt.msg+'</p>');
		$msg.appendTo($ct);

		//生成询问框按钮
		var $ft = $('<div class="confirm-ft"></div>');

		if (opt.btns == true) { //生成默认按钮
			var $btn1 = $('<button class="s-ok">确定</button>');
			var $btn2 = $('<button class="s-cancel">取消</button>');
			$btn1.click(function() {
				if (opt.onOk() != false) {
					$confirm.close();
				}
			}).appendTo($ft);
			$btn2.click(function() {
				opt.onCancel();
				$confirm.close();
			}).appendTo($ft);
		} else if (opt.btns && opt.btns.length > 0) { //生成自定义按钮
			var fun = {};
			for (i in opt.btns) {
				var item = jQuery.extend({
					name: '自定义',         //按钮的名称
					className: 's-ok',          //自定义样式
					callback: function() {} //点击按钮的事件，返回false可阻止询问框关闭
				}, opt.btns[i] || {});
				var $btn = $('<button class="'+item.className+'">'+item.name+'</button>');
				fun['fun'+i] = item.callback;
				$btn.data('num', i).click(function() {
					if (fun['fun'+$(this).data('num')]($confirm) != false) {
						$confirm.close();
					}
				}).appendTo($ft);
			}
		} else {
			$ft = '';
		}
		$confirmBox.append(
			$confirm.append($tt)
					.append($ct)
					.append($ft)
			).appendTo('body');
		$confirm.css({
	        'margin-left': -$confirm.innerWidth()/2,
	        'margin-top': -$confirm.innerHeight()/2
		});
		$msg.css('margin-top', -$msg.innerHeight()/2);

		return $confirm;
	};

	/**
	 * 会话框方法
	 * @param  {json} opt 配置参数
	 * @return {obj}      返回会话框的jQuery对象
	 */
	var _moveDialogObj = undefined;
	var _objStartXY = {};
	var _eventStartXY = {};
	dDialog = function(opt) {
		opt = jQuery.extend({
			type: 1,
			title: '',
			area: [1200, 900],
			content: '',
			btns: true,
			move: true,
			position: 'center center',
			onOk: function() {},
			onCancel: function() {}
		}, opt || {});
		var maxWidth = $(w).width() - 100;
		var maxHeight = $(w).height() - 100;
		var width = opt.area[0] >  maxWidth ? maxWidth : opt.area[0];
		var height = opt.area[1] >  maxHeight ? maxHeight : opt.area[1];

		//生成询问框对象
		var $dialogBox = $('<div class="d-dialog-box d-shade"></div>');
		var $dialog = $('<div class="d-dialog d-anim"></div>');

		//生成询问框标题
		var ttHtml = [
			'<div class="dialog-tt">',
				'<p>'+opt.title+'</p>',
			'</div>'
		];
		var $tt = $(ttHtml.join(''));
		if (opt.move) {
			$tt.addClass('z-move');
			$tt.mousedown(function(e) {
				if ($dialog.hasClass('z-full')) return;
				_moveDialogObj = $dialog.addClass('z-move');
				_objStartXY = {
					x: parseInt(_moveDialogObj.css('left')),
					y: parseInt(_moveDialogObj.css('top'))
				}
				_eventStartXY = {
					x: e.clientX,
					y: e.clientY
				}
			});
			$dialogBox.mousemove(function(e) {
				if (!_moveDialogObj) return;
				var maxX = $(w).width() - width;
				var maxY = $(w).height() - height;

				var aimX = _objStartXY.x + e.clientX - _eventStartXY.x;
				var aimY = _objStartXY.y + e.clientY - _eventStartXY.y;
				aimX = aimX < 0 ? 0 : (aimX > maxX ? maxX : aimX);
				aimY = aimY < 0 ? 0 : (aimY > maxY ? maxY : aimY);

				_moveDialogObj.css({
					left: aimX,
					top: aimY
				})
			}).mouseup(function() {
				if (!_moveDialogObj) return;
				_moveDialogObj.removeClass('z-move');
				_moveDialogObj = undefined;
			});
		}

		var $mini = $('<a href="javascript:" title="最小化"><i class="df df-popup-mininum"></i></a>');
		var $max = $('<a href="javascript:" title="最大化"><i class="df df-popup-maximize"></i></a>');
		var $window = $('<a href="javascript:" style="display: none;" title="还原"><i class="df df-popup-windowed"></i></a>');
		var $close = $('<a href="javascript:" title="关闭"><i class="df df-popup-close"></i></a>');

		$mini.click(function() {
			var $queue = $('#dDialogQueue');
			if ($queue.length == 0) {
				$queue = $('<div id="dDialogQueue" class="d-dialog-queue"></div>').appendTo('body');
			}
			$(this).hide();
			$max.hide();
			$window.show();
			$dialogBox.hide();
			$dialog.addClass('z-mini');
			$tt.appendTo($queue);
		}).mousedown(function(e) {
			e.stopPropagation();
		});

		$max.click(function() {
			$(this).hide();
			$mini.hide();
			$window.show();
			$dialog.addClass('z-full');
		}).mousedown(function(e) {
			e.stopPropagation();
		});

		$window.click(function() {
			$(this).hide();
			$mini.show();
			$max.show();

			if ($dialog.hasClass('z-full')) {
				$dialog.removeClass('z-full');
			} else if ($dialog.hasClass('z-mini')) {
				$dialog.removeClass('z-mini');
				$tt.prependTo($dialog);
				$dialogBox.show();
			}
		}).mousedown(function(e) {
			e.stopPropagation();
		});

		$close.click(function() {
			$dialog.close();
			$dialogBox.remove();
			$tt.remove();
		}).mousedown(function(e) {
			e.stopPropagation();
		});

		$tt.append($close)
		   .append($window)
		   .append($max)
		   .append($mini);

		//生成询问框主体
		var $ct = $('<div class="dialog-ct"></div>');
		if (opt.type == 1) {
			$ct.html(opt.content);
		} else if (opt.type == 2) {
			var index = 'i'+(new Date).getTime();
			var $iframe = $('<iframe src="'+opt.content+'" frameborder="0" width="100%" height="100%" name="'+index+'"></iframe>');
			var sw = null;
			var s$ = null;
			$iframe[0].onload = function() {
				sw = this.contentWindow;
				s$ = sw.jQuery || null;
				sw.thisDialog = $dialog;
			}
			$ct.html($iframe);
		}

		//生成询问框按钮
		var $ft = $('<div class="dialog-ft"></div>');

		if (opt.btns == true) { //生成默认按钮
			var $btn1 = $('<button class="s-ok">确定</button>');
			var $btn2 = $('<button class="s-cancel">取消</button>');
			$btn1.click(function() {
				if (opt.onOk(sw, s$) != false) {
					$dialog.close();
				}
			}).appendTo($ft);
			$btn2.click(function() {
				opt.onCancel(sw, s$);
				$dialog.close();
			}).appendTo($ft);
		} else if (opt.btns && opt.btns.length > 0) { //生成自定义按钮
			var fun = {};
			for (i in opt.btns) {
				var item = jQuery.extend({
					name: '自定义',         //按钮的名称
					className: 's-ok',    //自定义样式
					callback: function() {} //点击按钮的事件，返回false可阻止询问框关闭
				}, opt.btns[i] || {});
				var $btn = $('<button class="'+item.className+'">'+item.name+'</button>');
				fun['fun'+i] = item.callback;
				$btn.data('num', i).click(function() {
					if (fun['fun'+$(this).data('num')](sw, s$) != false) {
						$dialog.close();
					}
				}).appendTo($ft);
			}
		} else {
			$ct.css('bottom', 0);
			$ft = '';
		}
		$dialogBox.append(
			$dialog.width(width)
				   .height(height)
				   .append($tt)
				   .append($ct)
				   .append($ft)
		).appendTo('body');

		var position = opt.position.split(' ');
		$dialog.css({
	        'left': position[1] == 'left' ? 0 : (position[1] == 'right' ? ($(w).width()-$dialog.innerWidth()) : ($(w).width()-$dialog.innerWidth())/2),
	        'top': position[0] == 'top' ? 0 : (position[0] == 'bottom' ? ($(w).height()-$dialog.innerHeight()) : ($(w).height()-$dialog.innerHeight())/2)
		});

		return $dialog.data('$tt', $tt);
	};

	$.fn.close = function() {
		var self = $(this);
		if (self.hasClass('d-alert')) {
	        self.fadeOut(300, function() {
	            self.remove();
	        });
		} else if (self.hasClass('d-confirm') || self.hasClass('d-dialog')) {
			if (self.data('$tt')) self.data('$tt').remove();
			self.parent('.d-shade').remove();
			self.remove();
		}
	};
})(jQuery, window, document);