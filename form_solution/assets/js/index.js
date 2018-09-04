(function(w, $, d) {
	index = {
		ready: function() {
			index.listener();
		},

		listener: function() {
			new formVaild({
				form: 'form',
				rule: {
					'username': [{
						type: 'empty',
						msg: '用户名不能为空'
					}, {
						type: 'async',
						url: 'assets/json/test.json',
						name: 'username',
						data: {
							type: 1
						},
						success: function(value) {

						},
						error: function(value) {

						},
						msg: '用户名已存在'
					}, {
						type: 'regexp',
						regexp: ['phone', 'email'],
						callback: {
							phone: function(value) {
								$('input[name="phone"]').val(value);
							},
							email: function(value) {
								$('input[name="email"]').val(value);
							}
						},
						msg: '请输入正确的手机号或邮箱'
					}],

					'age': [{
						type: 'range',
						range: [18, 30],
						msg: '年龄必须在18岁至30岁之间'
					}, {
						type: 'function',
						fun: function(value, json) {
							return value != 20;
						},
						msg: '年龄不能为20岁'
					}],

					'interest': [{
						type: 'check',
						total: [1,3],
						msg: '请勾选1至3项'
					}, {
						type: 'async',
						url: 'assets/json/test.json',
						name: 'interest',
						data: {
							type: 2
						},
						success: function(value) {

						},
						error: function(value) {

						},
						msg: '兴趣已存在'
					}],

					'agree': [{
						type: 'empty',
						msg: '请阅读并同意用户协议',
						success: function() {
							console.log('123')
						}
					}]
				},

				vaildAll: true,

				success: function(name, type) {
					console.log('字段名：'+name+';校验类型：'+type+';校验结果：true');
				},

				error: function(name, type, msg) {
					console.log('字段名：'+name+';校验类型：'+type+';校验结果：false');
				}
			});
		}
	}

	$(index.ready);
})(window, jQuery, document);