require([
	'jquery',
	'popups'
], function($, popups) {
	$('#alert0').click(function() {
		popups.message({
			msg: '这里是消息框'
		});
	});

	$('#alert1').click(function() {
		popups.message({
			msg: '这里是消息框',
			ico: 'success'
		});
	});

	$('#alert2').click(function() {
		popups.message({
			msg: '这里是消息框',
			ico: 'fail'
		});
	});

	$('#confirm').click(function() {
		popups.confirm({
			msg: '确认删除？',
			ico: 'warn'
		});
	});

	$('#dialog').click(function() {
		popups.dialog({
			type: 2,
			title: '会话框',
			area: [1920, 1280],
            content: 'http://www.baidu.com/',
            callback: function(value) {
                console.log(value)
            }
		});
	});

	$('#dialog2').click(function() {
		popups.dialog({
			type: 2,
			title: '会话框2',
			area: [800, 600],
			position: 'bottom right',
			content: ''
		});
	});
});