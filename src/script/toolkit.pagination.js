/**
 * Version: 1.0.0
 * Author: Woody
 * Description: 分页插件
 * Date: 2019-05-24
**/
define([
	'jquery',
	'pagination_css'
], function($) {
	var initFrame = function() {
		var $content = $([
			'<div class="d-pagination">',
				'<div class="page-info j-page-count"></div>',
				'<div class="page-btn">',
					'<div class="page-block j-page-prev">上一页</div>',
                    '<ul class="page-list"></ul>',
					'<div class="page-block j-page-next">下一页</div>',
					'<div class="page-jump"><form>',
						'<span>到第</span>',
						'<input type="text">',
						'<span>页</span>',
						'<button class="page-block">确定</button>',
					'</form></div>',
				'</div>',
			'</div>'
		].join(''));

		this.dom = {
			count: $content.find('.j-page-count'),
			prev: $content.find('.j-page-prev'),
			next: $content.find('.j-page-next'),
			list: $content.find('ul'),
			ipt: $content.find('input'),
			form: $content.find('form')
		};

		this.box.html($content);
		bindEvent.call(this);
    };
    
    var updatePageBtn = function() {
        var obj = this,
            page = this.pageNum,
            count = this.pageCount;

        var c = 0;
        function btn(i) {
            c++;
            if (i) {
                return '<li class="page-block'+(page == i ? ' z-crt' : '')+'" page="'+i+'">'+i+'</li>';
            } else {
                return '<li class="page-block z-dis">...</li>';
            }
        }
        this.dom.list.html([
            btn(1),
            (function() {
                var start = page > 5 ? page - 2 : 2;
                if (count - start < 6) {
                    start -= (6 - count + start);
                    start = start < 2 ? 2 : start;
                }
                var html = start == 2 ? '' : btn(0);
                for (var i = start; i < count && c < 8; i++) {
                    html += (c == 7 && count - i > 1) ? btn(0) : btn(i);
                }
                return html;
            })(),
            (count > 1 ? btn(count) : '')
        ].join('')).find('li').click(function() {
            if ($(this).hasClass('z-dis') || $(this).hasClass('z-crt')) return;
            obj.jump($(this).attr('page'));
		});

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

        this.dom.count.text('当前' + ((page - 1) * this.opt.pageSize + 1) + '-' + (page == this.pageCount ? this.total : page * this.opt.pageSize) + '，共' + this.total+'条');
    };

	var bindEvent = function() {
        var page = this;
		page.dom.prev.click(function() {
			if ($(this).hasClass('z-dis')) return;
			page.opt.callback(page.pageNum - 1);
		});
		page.dom.next.click(function() {
			if ($(this).hasClass('z-dis')) return;
			page.opt.callback(page.pageNum + 1);
        });
        page.dom.form.submit(function() {
            var n = parseInt(page.dom.ipt.val().trim());
            if (n || n === 0) {
                n = n < 1 ? 1 : n > page.pageCount ? page.pageCount : n;
                page.jump(n);
            }
            page.dom.ipt.val('');
            return false;
        });
	};

	var main = function(opt) {
		return new main.fn.init(opt);
	};

	main.fn = main.prototype = {
		init: function(opt) {
			opt = $.extend({
                total: 1,  // 数据条数
                pageSize: 20,  // 分页数
                immediate: true,  // 初始化是否执行回调
				callback: function() {}
			}, opt || {});

			this.opt = opt;
            this.box = $(opt.box).eq(0);
            
            initFrame.call(this);

            this.setTotal(opt.total);
            opt.immediate && this.jump(1);

			return this;
		},

		jump: function(page, callback) {
			page = page || this.pageNum || 1;

			if (page < 1) page = 1;
			if (page > this.pageCount) page = this.pageCount;
            
            this.pageNum = page;
            
            updatePageBtn.call(this);

            callback !== false && this.opt.callback(page);
			return this;
        },

        setTotal: function(num) {
            num = parseInt(num);
            if (!num || num == this.total) return this;

			this.pageCount = Math.ceil(num / this.opt.pageSize);
            this.total = num;
            
            updatePageBtn.call(this);
            
            return this;
        }
	};

	main.fn.init.prototype = main.fn;
	
	return main;
});