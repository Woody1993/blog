(function(w, $, d) {
	$.fn.chk = function(state) {
		$(this).each(function() {
			var $o = $(this).closest('.u-chk');
			if (!$o.length || $o.hasClass('z-dis')) return;
			if ((state && state == 'chk') || (!state && !$o.hasClass('z-chk'))) {
				if ($o.hasClass('u-radio')) {
					var name = $o.find('input').attr('name');
					if (name) {
						$('.u-radio input[name='+name+']').removeAttr('checked').closest('.u-radio').removeClass('z-chk');
					}
				}
				$o.addClass('z-chk').find('input').attr('checked', 'checked');
			} else if ((state && state == 'unchk') || (!state && $o.hasClass('z-chk'))) {
				$o.removeClass('z-chk').find('input').removeAttr('checked');
			}
		});
	};

	dAlert = function(opt) {
		opt = $.extend({
			msg: '这里是提示框',
			ico: '',
			timeout: 1500,
			shade: false,
			callback: function() {}
		}, opt);
		$('.d-alert').remove();
		var index = (new Date()).getTime();
		var alert = $([
			'<div class="d-alert z-' + opt.ico + '" id="alert_' + index + '">',
			(opt.ico ? '<i class="tf tf-' + opt.ico + '"></i>' : ''),
			'<p>' + opt.msg + '</p>',
			'</div>'
		].join(''));
		if (opt.shade) {
			var alertBox = $('<div class="d-alert-box"></div>').appendTo('body').append(alert);
		} else {
			alert.appendTo('body')
		}
		alert.fadeIn(400, function() {
			setTimeout(function() {
				alert.fadeOut(400, function() {
					alert.remove();
					opt.callback();
				});
			}, opt.timeout);
		}).css({
			'margin-left': -alert.innerWidth() / 2,
			'margin-top': -alert.innerHeight() / 2
		}).click(function() {
			$(this).remove();
			if (alertBox) alertBox.remove();
			opt.callback();
		}).css({
			'margin-left': -alert.innerWidth() / 2,
			'margin-top': -alert.innerHeight() / 2
		});
	}

	dMessage = function(opt) {
		opt = $.extend({
			msg: '这里是消息框',
			seat: 'bottom',  // top || bottom
			closeBtn: true,
			btns: false
		}, opt || {});

		$('.d-message').remove();

		var message = $('<div class="d-message '+opt.seat+'"><p>'+opt.msg+'</p></div>').appendTo('body');

		message.append((function() {
			var $o = $('<div class="d-message-btn"></div>');
			for (var i in opt.btns) {
				var $b = $('<a>'+opt.btns[i].name+'</a>').click((function(item) {
					return function(e) {
						if (item.callback && item.callback(e) == false) return;
						message.removeClass('z-show');
					}
				})(opt.btns[i])).appendTo($o);
			}
			return $o;
		})());

		message.append($('<a class="d-message-close">X</a>').click(function() {
			message.removeClass('z-show');
		}));

		setTimeout(function() {
			message.addClass('z-show');
		}, 0);
	}
})(window, jQuery, document);