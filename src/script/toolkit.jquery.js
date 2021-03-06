define([
	'lib/jquery',
	'tools',
	'popups'
], function($, tool, popups) {
	$.ajax = (function(ajax) {
		return function(opt) {
			opt = $.extend({
				url: '',
				type: 'post',
				dataType: 'json',
				data: {},
				success: function() {},
				fail:function() {},
				complete: function() {}
			}, opt || {});
	
			return ajax({
				url: opt.url,
				type: opt.type,
				data: opt.data,
				dataType: opt.dataType,
				success: function(data) {
                    if (opt.dataType == 'json') {
                        if (data.state) {
                            opt.success(data.obj, data.message);
                        } else if (opt.fail(data.obj, data.message) !== false) {
                            popups.message({
                                msg: data.message || '查询失败',
                                ico: 'fail'
                            });
                        }
    
                        opt.complete(data.state, data.obj, data.message);
                    } else {
                        opt.success(data);
                    }
				},
				error: function(e) {
					if (e.statusText != 'abort') {
						popups.message({
							msg: '接口异常',
							ico: 'fail'
						});
					}
				}
				
			});
		}
	})($.ajax);
	
	return $;
});