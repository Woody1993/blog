/**
 * Version: 1.0.0
 * Author: Woody
 * Description: 功能大纲：
 * 				message 消息框
 *              confirm 询问框
 *              dialog 会话框
 * Date: 2021-02-26
**/

define([
	'lib/jquery',
	'popups_css'
], function($) {
	var _moveDialogObj = undefined;
	var _objStartXY = {};
    var _eventStartXY = {};
    
    var _message;

    function Handle(type, obj) {
        var o = {
            close: function() {
                obj.addClass('an-fadeout');

                if (type == 'msg') {
                    clearTimeout(main.timer);
                } else if (type == 'dialog') {
                    $('.d-popups-layer').addClass('an-fadeout');
                }

                setTimeout(function() {
                    if (type == 'loading') {
                        obj.parent().css('position', obj.attr('position'));
                    } else if (type == 'dialog') {
                        $('.d-popups-layer').remove();
                    }
                    obj.remove();
                }, 300);
            }
        }

        if (type == 'dialog') {
            o.hide = function() {
                if (!this.hidden) {
                    obj.addClass('an-fadeout');
                    $('.d-popups-layer').addClass('an-fadeout');
    
                    setTimeout(function() {
                        obj.hide();
                        $('.d-popups-layer').remove();
                    }, 300);
    
                    this.hidden = true;
                }
            }

            o.show = function() {
                if (this.hidden) {
                    this.hidden = false;
                    obj.show();
                    obj.removeClass('an-fadeout');
                    main.layer();
                }
            }
            
            o.call = function(fun) {
            	fun(this.w, this.$)
            }
        }

        return o;
    }
    
    var main = {
        loading: function(opt) {
            opt = $.extend({
                box: 'body'
            }, opt || {});

            var $box = $(opt.box), position = $box.css('position');
            if (['static', 'inherit'].includes(position)) {
                $box.css('position', 'relative');
            }

            var $loading = $([
                '<div class="d-loading flex-center an-fadein" position="' + position + '"></div>'
            ].join('')).appendTo($box);

            var handle = new Handle('loading', $loading);
            return handle;
        },

        message: function(opt) {
            opt = $.extend({
                msg: '',
                ico: false,
                timeout: 2500,
                callback: function() {}
            }, opt || {});
    
            _message && _message.close();

            var $message = $([
                '<div class="d-message flex-column flex-center an-fadein">',
                    (opt.ico == false ? '' : '<i class="df df-' + opt.ico + '"></i>'),
                    '<p>' + opt.msg + '</p>',
                '</div>'
            ].join('')).appendTo('body');

            this.timer = setTimeout(function() {
                handle.close();
                opt.callback();
            }, opt.timeout);

            $message.click(function() {
                handle.close();
                opt.callback();
            });;
    
            var handle = _message = new Handle('msg', $message);
            return handle;
        },
        
        confirm: function(opt) {
            opt = $.extend({
                title: '提醒消息',
                msg: '',
                type: 'ask',
                btns: [{
                    name: '确定',
                    className: 'hl',
                    value: 1
                }, {
                    name: '取消',
                    value: 0
                }],
                onOk: function() {},
                onCancel: function() {}
            }, opt || {});

            return this.dialog({
                type: 1,
                area: [380, 'auto'],
                title: opt.title,
                content: [
                    '<div class="confirm-content flex-center">',
                        '<i class="df df-'+opt.type+'"></i>',
                        '<div class="flex-grow">'+opt.msg+'</div>',
                    '</div>'
                ].join(''),
                btns: opt.btns,
                closeBtn: false,
                callback: opt.callback
            });
        },
        
        dialog: function(opt) {
            opt = $.extend({
                type: 1,
                title: '',
                area: [1200, 900],
                content: '',
                btns: true,
                move: true,
                closeBtn: true,
                position: 'center center',
                callback: function() {}
            }, opt || {});

            if (opt.btns === true) {
                opt.btns = [{
                    name: '确定',
                    className: 'hl',
                    value: 1
                }, {
                    name: '取消',
                    value: 0
                }];
            }

            var maxWidth = $(window).width() - 100;
            var maxHeight = $(window).height() - 300;
            var width = opt.area[0] >  maxWidth ? maxWidth : opt.area[0];
            var height = opt.area[1] == 'auto' ? 'auto' : opt.area[1] >  maxHeight ? maxHeight : opt.area[1];

            //生成会话框对象
            main.layer();
            var $dialogBox = $('<div class="d-dialog-box an-fadein"></div>').appendTo('body');
            var $dialog = $('<div class="d-dialog an-bounce"></div>').width(width).appendTo($dialogBox);

            //生成会话框标题
            var $head = $([
                '<div class="dialog-head flex-between-center">',
                    '<p class="flex-grow">'+opt.title+'</p>',
                '</div>'
            ].join('')).appendTo($dialog);

            if (opt.closeBtn) {
                $('<a title="关闭"><i class="df df-dialog-close"></i></a>').click(function() {
                	opt.closeType == 'hide' ? handle.hide() : handle.close();
                }).mousedown(function(e) {
                    e.stopPropagation();
                }).appendTo($head);
            }

            if (opt.move) {
                $head.addClass('z-move');
                $head.mousedown(function(e) {
                    if ($dialogBox.hasClass('z-full')) return;
                    _moveDialogObj = $dialogBox.addClass('z-move');
                    _objStartXY = {
                        x: parseInt(_moveDialogObj.css('left')),
                        y: parseInt(_moveDialogObj.css('top'))
                    }
                    _eventStartXY = {
                        x: e.clientX,
                        y: e.clientY
                    }
                });

                document.addEventListener('mousemove', function(e) {
                    if (!_moveDialogObj) return;
                    var maxX = $(window).width() - width;
                    var maxY = $(window).height() - $dialogBox.height();

                    var aimX = _objStartXY.x + e.clientX - _eventStartXY.x;
                    var aimY = _objStartXY.y + e.clientY - _eventStartXY.y;
                    aimX = aimX < 0 ? 0 : (aimX > maxX ? maxX : aimX);
                    aimY = aimY < 0 ? 0 : (aimY > maxY ? maxY : aimY);

                    _moveDialogObj.css({
                        left: aimX,
                        top: aimY
                    })
                });
                document.addEventListener('mouseup', function(e) {
                    if (!_moveDialogObj) return;
                    _moveDialogObj.removeClass('z-move');
                    _moveDialogObj = undefined;
                });
            }

            // var $mini = $('<a href="javascript:" title="最小化"><i class="df df-dialog-mini"></i></a>');
            // var $full = $('<a href="javascript:" title="最大化"><i class="df df-dialog-full"></i></a>');
            // var $window = $('<a href="javascript:" style="display: none;" title="还原"><i class="df df-dialog-window"></i></a>');
            // $mini.click(function() {
            //     var $queue = $('#dDialogQueue');
            //     if ($queue.length == 0) {
            //         $queue = $('<div id="dDialogQueue" class="d-dialog-queue"></div>').appendTo('body');
            //     }
            //     $(this).hide();
            //     $full.hide();
            //     $window.show();
            //     $dialogBox.hide();
            //     $dialog.addClass('z-mini');
            //     $head.appendTo($queue);
            // }).mousedown(function(e) {
            //     e.stopPropagation();
            // });

            // $full.click(function() {
            //     $(this).hide();
            //     $mini.hide();
            //     $window.show();
            //     $dialog.addClass('z-full');
            // }).mousedown(function(e) {
            //     e.stopPropagation();
            // });

            // $window.click(function() {
            //     $(this).hide();
            //     $mini.show();
            //     $full.show();

            //     if ($dialog.hasClass('z-full')) {
            //         $dialog.removeClass('z-full');
            //     } else if ($dialog.hasClass('z-mini')) {
            //         $dialog.removeClass('z-mini');
            //         $head.prependTo($dialog);
            //         $dialogBox.show();
            //     }
            // }).mousedown(function(e) {
            //     e.stopPropagation();
            // });

            //生成会话框主体
            var $body = $('<div class="dialog-body"></div>').height(height).appendTo($dialog);
            if (opt.type == 1) {
                $body.html(opt.content);
            } else if (opt.type == 2) {
                var sw, s$;
                $('<iframe frameborder="0" width="100%" height="100%"></iframe>').attr('src', opt.content).appendTo($body)[0].onload = function() {
                    sw = this.contentWindow;
                    s$ = sw.jQuery || undefined;
                    sw.thisDialog = $dialog;
                    
                    handle.w = sw;
                    handle.$ = s$;
                }
            }

            //生成会话框按钮
            if (opt.btns && opt.btns.length > 0) {
                var $foot = $('<div class="dialog-foot flex-between-center flex-reverse"></div>').appendTo($dialog);
                var $btns = $('<div class="flex"></div>').appendTo($foot);
                opt.btns.forEach(function(item) {
                    $('<button>' + item.name + '</button>').addClass(item.className).click(function() {
                        if (opt.callback(item.value, sw, s$) !== false) {
                            handle.close();
                        }
                    }).appendTo($btns);
                });
            }

            var position = opt.position.split(' ');
            $dialogBox.css({
                'left': position[1] == 'left' ? 0 : (position[1] == 'right' ? ($(window).width() - $dialogBox.width()) : ($(window).width() - $dialogBox.width()) / 2),
                'top': position[0] == 'top' ? 0 : (position[0] == 'bottom' ? ($(window).height() - $dialogBox.height()) : ($(window).height() - $dialogBox.height()) / 2)
            });

            var handle = new Handle('dialog', $dialogBox);
            return handle;
        },

        layer: function() {
            $('<div class="d-popups-layer an-fadein"></div>').appendTo('body');
        }
    }

    return main;
});