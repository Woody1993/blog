require.config({
	baseUrl: 'src/script/',
	urlArgs: 't=' + new Date().getTime(),
	paths: {
		jQuery: 'jQuery',
		test: 'test',
		text: 'require.text',
		css: 'require.css'
	},
	shim: {
		'jQuery': {
			exports: 'jQuery'
		}
	},
	config: {
		text: {
			onXhr: function(xhr, url) {
				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			}
		}
	}
});