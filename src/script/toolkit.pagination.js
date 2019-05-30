/**
 * Version: 1.0.0
 * Author: Woody
 * Description: 分页插件
 * Date: 2019-05-24
**/
define([
	'jquery',
	'tools',
	'pagination_css'
], function($, tools) {
	var initFrame = function(obj) {
		var $content = $([
			'<div class="d-pagination">',
				'<div class="page-info j-page-count"></div>',
				'<div class="page-btn j-page-btn">',
					'<div class="page-block j-page-prev">上一页</div>',
					'<div class="page-block j-page-first">1</div>',
					'<div class="page-block j-page-before">...</div>',
					'<div class="page-list">',
						'<ul>',
							(function() {
								var html = '';
								for (var i = 2; i < obj.pageCount; i++) {
									html += '<li class="page-block">'+i+'</li>';
								}
								return html;
							})(),
						'</ul>',
					'</div>',
					'<div class="page-block j-page-after">...</div>',
					(obj.pageCount > 1 ? '<div class="page-block j-page-last">'+obj.pageCount+'</div>' : ''),
					'<div class="page-block j-page-next">下一页</div>',
					'<div class="page-jump">',
						'<span>到第</span>',
						'<input class="j-page-ipt" type="text">',
						'<span>页</span>',
						'<div class="page-block j-page-btn">确定</div>',
					'</div>',
				'</div>',
			'</div>'
		].join(''));

		obj.dom = {
			count: $content.find('.j-page-count'),
			btn: $content.find('.j-page-btn'),
			prev: $content.find('.j-page-prev'),
			first: $content.find('.j-page-first'),
			before: $content.find('.j-page-before'),
			after: $content.find('.j-page-after'),
			last: $content.find('.j-page-last'),
			next: $content.find('.j-page-next'),
			list: $content.find('ul'),
			page: $content.find('li'),
			ipt: $content.find('.j-page-ipt'),
			btn: $content.find('.j-page-btn')
		};

		obj.box.html($content);
		bindEvent(obj);
	};

	var bindEvent = function(obj) {
		obj.dom.prev.click(function() {
			if ($(this).hasClass('z-dis')) return;
			obj.opt.callback(obj.pageNum - 1);
		});
		obj.dom.next.click(function() {
			if ($(this).hasClass('z-dis')) return;
			obj.opt.callback(obj.pageNum + 1);
		});
		obj.dom.first.click(function() {
			obj.opt.callback(1);
		});
		obj.dom.last.click(function() {
			obj.opt.callback(obj.pageCount);
		});
		obj.dom.page.click(function() {
			obj.opt.callback($(this).index() + 2);
		});
	};

	var main = function(opt) {
		return new main.fn.init(opt);
	};

	main.fn = main.prototype = {
		init: function(opt) {
			opt = $.extend({
				pageSize: 20,  // 分页数
				callback: function() {}
			}, opt || {});

			this.opt = opt;
			this.box = $(opt.box).eq(0);

			return this;
		},

		jump: function(page, total) {
			page = page || this.pageNum || 1;
			total = total || this.total || 1;

			if (page == this.pageNum) return this;

			this.pageCount = Math.ceil(total / this.opt.pageSize);

			if (page < 1) page = 1;
			if (page > this.pageCount) page = this.pageCount;
			
			this.pageNum = page;

			if (total != this.total) {
				initFrame(this);
			}

			this.total = total;

			this.dom.crt && this.dom.crt.removeClass('z-crt');
			
			if (page > 1 && page < this.pageCount) {
				this.dom.crt = this.dom.page.eq(page - 2).addClass('z-crt');
			} else {
				if (page == 1) {
					this.dom.crt = this.dom.first.addClass('z-crt');
				};
				if (page == this.pageCount) {
					this.dom.crt = this.dom.last.addClass('z-crt');
				};
			};

			if (page > 1) {
				this.dom.prev.removeClass('z-dis');
			} else {
				this.dom.prev.addClass('z-dis');
			};
			if (page < this.pageCount) {
				this.dom.next.removeClass('z-dis');
			} else {
				this.dom.next.addClass('z-dis');
			};

			var ml = (4 - page) * 34,
				maxMl = -(this.pageCount - 7) * 34
			this.dom.list.css('margin-left', ml > 0 ? 0 : (ml < maxMl ? maxMl : ml));	

			this.dom.count.text('当前' + ((page - 1) * this.opt.pageSize + 1) + '-' + (page == this.pageCount ? total : page * this.opt.pageSize) + '，共' + total+'条');
			return this;
		}
	};

	main.fn.init.prototype = main.fn;
	
	return main;
});