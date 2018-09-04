(function(w, $, d) {
	var htmlDOM = d.documentElement,
		isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1,
		isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
		isWX = navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
		fontSize = 0;

	// 计算根节点字体大小及系统类型
	(function() {
		var width = htmlDOM.clientWidth;
		width = width > 640 ? 640 : width;
		fontSize = width / 7.5;
		htmlDOM.style.fontSize = fontSize + 'px';

		w.onresize = function() {
			var width = htmlDOM.clientWidth;
			width = width > 640 ? 640 : width;
			fontSize = width / 7.5;
			htmlDOM.style.fontSize = fontSize + 'px';
		}
		
		if (isAndroid) {
			$(htmlDOM).addClass('android');
			if (typeof(WeixinJSBridge) == "undefined") {
				d.addEventListener("WeixinJSBridgeReady", function(e) {
					setTimeout(function() {
						WeixinJSBridge.invoke('setFontSizeCallback', {
							"fontSize": 0
						}, function(res) {
							// alert(JSON.stringify(res)); 
						});
					}, 0);
				});
			} else {
				setTimeout(function() {
					WeixinJSBridge.invoke('setFontSizeCallback', {
						"fontSize": 0
					}, function(res) {
						// alert(JSON.stringify(res)); 
					});
				}, 0);
			}
		}

		if (isIOS) $(htmlDOM).addClass('ios');
	})();

	main = {
		ready: function() {
			main.initCheck();
			main.listener();
		},

		listener: function() {
			$('.m-form .form-unit .u-ipt').keyup(function() {
				var $btn = $(this).closest('.form-row').find('.form-op-clear');
				if ($(this).val().length > 0) {
					$btn.show();
				} else {
					$btn.hide();
				}
			}).focus(function() {
				if ($(this).val().length > 0) {
					$(this).closest('.form-row').find('.form-op-clear').show();
				}
			}).blur(function() {
				$(this).closest('.form-row').find('.form-op-clear').hide();
			});

			$('.m-form .form-op-clear').click(function() {
				$(this).hide().closest('.form-row').find('.form-unit .u-ipt:visible').val('').focus();
			});

			$('.m-form .form-op-eye').click(function() {
				var $btn = $(this).find('i');
				var $ipt = $(this).closest('.form-row').find('.form-unit .u-ipt:visible');
				if ($btn.hasClass('rev')) {
					$btn.removeClass('rev');
					$ipt.prop('type', 'password').focus();
				} else {
					$btn.addClass('rev');
					$ipt.prop('type', 'text').focus();
				}
			});
		},

		initCheck: function() {
			var $chks = $('input[type="checkbox"].u-chk, input[type="radio"].u-chk');
			var attrFilter = ['type', 'text', 'checked', 'disabled', 'style', 'name'];
			$chks.each(function() {
				var type = $(this).attr('type');
				var text = $(this).attr('text');
				var checked = $(this).attr('checked') != undefined ? true : false;
				var disabled = $(this).attr('disabled') != undefined ? true : false;

				var attrs = $(this)[0].attributes;

				var $chk = $([
					'<div>',
						'<ins></ins>',
						(text ? '<span>'+text+'</span>' : ''),
					'</div>'
				].join(''));

				for (i in attrs) {
					var name = attrs[i].name;
					var value = attrs[i].value;

					if (attrFilter.indexOf(name) == -1) {
						$chk.attr(name, value);
					}
				}

				$chk.addClass(type == 'checkbox' ? 'u-checkbox':'u-radio');

				if (checked) {
					$chk.addClass('z-chk');
					$(this).attr('checked', 'true');
				}

				if (disabled) {
					$chk.addClass('z-dis');
					$(this).attr('disabled', 'true');
				}

				$(this).removeAttr('class text id style').after($chk).appendTo($chk);

				if (type == 'checkbox') {
					$chk.click(function() {
						$(this).chk();
					});
				} else {
					$chk.click(function() {
						$(this).chk('chk');
					});	
				}
			});
		}
	}

	$(main.ready);
})(window, jQuery, document);