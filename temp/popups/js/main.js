$(function() {
	$('#alert0').click(function() {
		dAlert({
			msg: '这里是消息框'
		});
	});

	$('#alert1').click(function() {
		dAlert({
			msg: '这里是消息框',
			ico: 'success'
		});
	});

	$('#alert2').click(function() {
		dAlert({
			msg: '这里是消息框',
			ico: 'error'
		});
	});

	$('#confirm').click(function() {
		dConfirm({
			msg: '确认删除？',
			ico: 'warning'
		});
	});

	$('#dialog').click(function() {
		dDialog({
			type: 2,
			title: '会话框',
			area: [1920, 1280],
			content: ''
		});
	});

	$('#dialog2').click(function() {
		dDialog({
			type: 2,
			title: '会话框2',
			area: [800, 600],
			position: 'bottom right',
			content: ''
		});
	});
})