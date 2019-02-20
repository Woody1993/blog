require.config({
	baseUrl: 'script',
	urlArgs: 'v=1.0.0',
	paths: {
		text: 'lib/require.text',
		css: 'lib/require.css',
		jquery: 'lib/jquery',
		tools: 'toolkit.tools',
		grid: 'toolkit.grid'
	},
	config: {
		text: {
			onXhr: function(xhr) {
				// 为请求增加表示是ajax的头
				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			}
		}
	}
});