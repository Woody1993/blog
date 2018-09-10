(function(w, $, d) {

	var regexp = {
		phone: /^1[0-9]{10}$/,  // 手机号
		tel: /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,  // 固定电话
		email: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,  // 邮箱
		idcard: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,  // 身份证号
		psw: /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,20}$/  // 密码，6-20位，包含字母数字以及!、@、#、$、%、^、&、*、.、~
	};

	var vaild = function(value, json) {
		if (value === '' && ['regexp', 'range'].indexOf(json.type) > -1) {
			return true;
		}

		switch(json.type) {
		case 'empty':
			if (value === '') return false;
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
			if (num != num) return false;
			if (num < json.range[0] || num > json.range[1]) return false;
			break;

		case 'check':
			var len = value ? value.split(',').length : 0;
			if (len < json.total[0] || len > json.total[1]) return false;
			break;

		case 'function':
			return json.fun(value) || false;
			break;
		}

		return true;
	}

	var item = function(name, value, rule, next) {
		if (!rule || !rule.length) {
			if (next) next(true);
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
				callback(index, vaild.call(self, value, r), r);
			}
		}
		loop(0);

		function callback(index, state, r) {
			if (state)  {
				if (!r.success || r.success(name, r.type) !== false) {
					self.opt.success(name, r.type);
				}
			} else {
				if (!r.error || r.error(name, r.type, r.msg || '提交数据有误，请检查后重试') !== false) {
					self.opt.error(name, r.type, r.msg || '提交数据有误，请检查后重试');
				}
			}

			if (index == rule.length-1 || !state) {
				if (next) next(state);
			} else {
				loop(++index);
			}
		}
	}

	var main = function(opt) {
		var self = this;
		this.opt = opt = $.extend({
			form: '',
			vaildAll: false,
			rule: {},
			success: function() {},
			error: function() {}
		}, opt || {});

		var $form = $(opt.form);
		if (!$form.length) return;

		$form.find('input, textarea').change(function() {
			var name = $(this).attr('name');
			if (!name) return;
			item.call(self, name, $(this).val(), opt.rule[name])
		});

		$form.submit(function() {
			try {
				var json = $(this).serialize();
				var state = true;

				var arr = [];
				for (var name in opt.rule) {
					arr.push(name);
				}

				function loop(index) {
					var name = arr[index];
					item.call(self, name, json[name], opt.rule[name], function(s) {
						if (!s) {
							state = false;
							if (!opt.vaildAll) {
								return;
							}
						}

						if (index == arr.length-1) {
							if (state) {
								$.ajax({
									url: 'assets/json/test.json',
									data: json,
									dataType: 'text',
									success: function(msg) {
										msg = JSON.parse(msg);
										console.log('已提交')
									}
								});
							}
						} else {
							loop(++index);
						}
					});
				}
				loop(0);
			} catch(e) {
				console.log(e);
			}

			return false;
		});
	}

	w.formVaild = main;
})(window, jQuery, document);