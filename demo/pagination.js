require([
	'jquery',
	'pagination'
], function($, pagination) {
	page = pagination({
		box: '#box',
		pageSize: 20,
		callback: function(num) {
			updatePage(num);
		}
	});

	function updatePage(num) {
		page.jump(num, 200);
	};

	updatePage(1);
});