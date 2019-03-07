(function(w, $, d) {
	w.form;

	index = {
		ready: function() {
			index.listener();
		},

		listener: function() {
			var isPhone;
			form = new formObject({
				form: 'form',
				rule: {
					'username': [{
						type: 'empty',
						msg: '用户名不能为空'
					}, {
						type: 'length',
						range: [10, 20],
						msg: '用户名长度为10到20字符'
					}, {
						type: 'regexp',
						regexp: ['phone', 'email'],
						callback: {
							phone: function(value) {
								$('input[name="phone"]').val(value);
								isPhone = true;
							},
							email: function(value) {
								$('input[name="email"]').val(value);
								isPhone = false;
							}
						},
						msg: '请输入正确的手机号或邮箱'
					}, {
						type: 'async',
						url: 'assets/json/test.json',
						name: 'username',
						data: {
							type: 1
						},
						pass: function(value) {

						},
						fail: function(value) {

						},
						msg: '用户名已存在'
					}],

					'sex': [{
						type: 'empty'
					}],

					'age': [{
						type: 'range',
						range: [18, 30],
						msg: '年龄必须在18岁至30岁之间'
					}, {
						type: 'function',
						fun: function(value) {
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
						pass: function(value) {
						},
						fail: function(value) {

						},
						msg: '兴趣已存在'
					}],

					'agree': [{
						type: 'empty',
						msg: '请阅读并同意用户协议',
						pass: function(value) {
						}
					}]
				},

				skip: {
					'agree': function() {
						return isPhone;
					}
				},

				vaildAll: true,

				pass: function(name, type) {
					console.log('字段名：'+name+';校验类型：'+type+';校验结果：true');
				},

				fail: function(name, type, msg) {
					if (name == 'username') {
						isPhone = false;
					}
					console.log('字段名：'+name+';校验类型：'+type+';校验结果：false');
					console.log(msg)
					console.log('---------------------------------------------')
				}
			});
		},

		setData: function() {
			form.voluation({
				"username": "15068749507",
				"password": "123456",
				"phone": "15068749507",
				"email": "245195432@qq.com",
				"sex": "man",
				"age": "25",
				"address": "凯旋路445号",
				"interest": ["看电影", "听音乐"],
				"agree": ["1"]
			})
		}
	}

	$(index.ready);
})(window, jQuery, document);