require([
	'jQuery',
	'test',
	'css!../style/reset.css',
	'css!../style/style.css'
], function($, m) {
	console.log(m)
	var a = m.showJq();

	require(['text!test.js'], function(data) {
		console.log(data)
	});
});