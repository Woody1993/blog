require([
	'jquery',
	'pagination'
], function($, pagination) {
	page = pagination({
        box: '#box',
        total: 2000,
		pageSize: 20,
		callback: function(num) {
            $('#page').text(num);
		}
    });
});