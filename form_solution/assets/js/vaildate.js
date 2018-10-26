(function(w, $, d) {

	var regexp = {
		phone: /^1[0-9]{10}$/,  // 手机号
		tel: /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,  // 固定电话
		email: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,  // 邮箱
		idcard: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,  // 身份证号
		psw: /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,20}$/  // 密码，6-20位，包含字母数字以及!、@、#、$、%、^、&、*、.、~
	};

	var checkRule = function(value, json) {
		if (['regexp', 'range'].indexOf(json.type) > -1 && (value === '' || value === undefined)) {
			return true;
		}

		switch(json.type) {
		case 'empty':
			if (value === '' || value === undefined) return false;
			break;

		case 'regexp':
			var state = true;
			for (var i in json.regexp) {
				var re = json.regexp[i];
				if (!regexp[re]) continue;
				if (regexp[re].test(value)) {
					state = true;
					if (json.callback && json.callback[re]) {
						json.callback[re](value);
					}
					break;
				} else {
					state = false
				}
			}
			return state;
			break;

		case 'range':
			var num = parseFloat(value);
			if (num != num) return true;
			if (num < json.range[0] || num > json.range[1]) return false;
			break;

		case 'check':
			var len = value ? value.length : 0;
			if (len < json.total[0] || len > json.total[1]) return false;
			break;

		case 'function':
			return json.fun(value) || false;
			break;
		}

		return true;
	}

	var checkItem = function(name, value, rule, next) {
		if (!rule || !rule.length) {
			if (next) next(true);
			return;
		}

		var self = this;
		function loop(index) {
			var r = rule[index];
			if (r.type == 'async') {
				$.ajax({
					url: r.url,
					data: (function() {
						var data = r.data || {};
						data[r.name] = value;
						return data;
					})(),
					dataType: r.dataType || 'text',
					success: function(msg) {
						msg = JSON.parse(msg);
						callback(index, msg.state, r);
					}
				});
			} else {
				callback(index, checkRule.call(self, value, r), r);
			}
		}
		loop(0);

		function callback(index, state, r) {
			if (state)  {
				if (!r.pass || r.pass(name, r.type) !== false) {
					self.opt.pass(name, r.type);
				}
			} else {
				if (!r.fail || r.fail(name, r.type, r.msg || '提交数据有误，请检查后重试') !== false) {
					self.opt.fail(name, r.type, r.msg || '提交数据有误，请检查后重试');
				}
			}

			if (index == rule.length-1 || !state) {
				if (next) next(state);
			} else {
				loop(++index);
			}
		}
	}

	function serialize($obj, opt) {
		opt = $.extend({
			overlay: false  // 相同的name值是否覆盖，否则以字符串数组的形式叠加
		}, opt || {});

		if ($obj[0].tagName == 'TABLE') {
			var arr = [];
			$obj.find('tbody tr').each(function() {
				arr.push(serialize($(this), opt));
				$(this).find('input[name], select[name], textarea[name]').addClass('j-serialized');
			});

			return arr;
		} else {
			var obj = {};
			var arr = [];
			$obj.find('table[name]').each(function() {
				var name = $(this).attr('name');
				obj[name] = serialize($(this), opt);
			});

			$obj.find('input[name], select[name], textarea[name]').each(function() {
				if ($(this).hasClass('j-serialized')) return;

				var name = $(this).prop('name').replace(/\[\d\]$/g, '');
				if (!name) return;
				if ($(this).prop('type') == 'checkbox') {
					if ($(this).prop('checked')) {
						obj[name] = obj[name] || [];
						obj[name].push($(this).val());
						if (arr.indexOf(name) == -1) arr.push(name);
					}
				} else if ($(this).prop('type') == 'radio') {
					if ($(this).prop('checked')) {
						obj[name] = $(this).val();
					}
				} else {
					if (opt.overlay || !obj[name]) {
						obj[name] = $(this).val();
					} else {
						if (!obj[name].push) obj[name] = [obj[name]];
						obj[name].push($(this).val());
						if (arr.indexOf(name) == -1) arr.push(name);
					}
				}
			});

			$obj.find('.j-serialized').removeClass('j-serialized');

			return obj;
		}
	};

	var main = function(opt) {
		var self = this;
		this.opt = opt = $.extend({
			form: '',
			itemFmt: {},
			vaildAll: false,
			rule: {},
			pass: function() {},
			fail: function() {}
		}, opt || {});

		this.$form = $(opt.form);
		if (!this.$form.length) return;

		this.$form.find('input, textarea').change(function() {
			var name = $(this).attr('name');
			if (!name) return;
			checkItem.call(self, name, $(this).val(), opt.rule[name])
		});

		return this;
	}

	w.formObject = main;

	main.prototype = {
		vaildate: function(callback) {
			var me = this;
			var opt = this.opt;
			var json = this.serialize();
			var state = true;

			var arr = [];
			for (var name in opt.rule) {
				arr.push(name);
			}

			function loop(index) {
				var name = arr[index];
				checkItem.call(me, name, json[name], opt.rule[name], function(s) {
					if (!s) {
						state = false;
						if (!opt.vaildAll) {
							return;
						}
					}

					if (index == arr.length-1) {
						if (state) {
							callback && callback();
						}
					} else {
						loop(++index);
					}
				});
			}
			loop(0);
		},

		serialize: function() {
			var me = this;
			var opt = this.opt;
			var data = serialize(me.$form)
			for (var i in opt.itemFmt) {
				if (data[i] !== undefined) {
					data[i] = opt.itemFmt[i](data[i]);
				}
			}
			return data;
		},

		voluation: function(data) {
			var me = this;
			for (var i in data) {
				var $o = $('[name="' + i + '"]');
				if ($o.length == 0) continue;
				if ($o[0].tagName == 'TABLE') {

				} else {
					if ($o.prop('type') == 'checkbox' || $o.prop('type') == 'radio') {
						$o.each(function() {
							if (
								$(this).val() == data[i] ||
								(data[i].indexOf && data[i].indexOf($(this).val()) > -1)
							) {
								$(this).chk('chk');
							}
						});
					} else {
						$o.val(data[i]);
					}
				}
			}
		}
	}
})(window, jQuery, document);