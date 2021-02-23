/**
 * Version: 1.0.0
 * Author: Woody
 * Description: 功能大纲：
 * 				config 功能配置
 *                  ├ beforeKeydown  当键盘按下时判断是否执行快捷键操作
 *                  ├ beforeInput  当焦点在文本框或文本域内时，除了通过此方法返回false的其他快捷键都会被屏蔽
 *                  └ ...
 *              listener 监听具体按键
 *              stop 停止监听具体按键
 * Date: 2021-02-22
**/

define(function() {
    var SHORTCUTS_EVENT = {};
    var SHORTCUTS_CONFIG = {};
    
    var shift = false,
        ctrl = false,
        alt = false;
    
    var inputFocus = false;
    
    var dictionary = {
        '~': '`',
        '!': '1',
        '@': '2',
        '#': '3',
        '$': '4',
        '%': '5',
        '^': '6',
        '&': '7',
        '*': '8',
        '(': '9',
        ')': '0',
        '_': '-',
        '+': '=',
        '{': '[',
        '}': ']',
        ':': ';',
        '"': "'",
        '<': ',',
        '>': '.',
        '?': '/',
        ' ': 'space',
        'arrowup': 'up',
        'arrowdown': 'down',
        'arrowleft': 'left',
        'arrowright': 'right'
    }
    
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
        case 'Shift':
            shift = true;
            break;
        case 'Control':
            ctrl = true;
            break;
        case 'Alt':
            alt = true;
            break;
        default:
            var value = e.key.toLowerCase();
            var key = (ctrl ? 'ctrl+' : '') + (shift ? 'shift+' : '') + (alt ? 'alt+' : '') + (dictionary[value] || value);

            if (SHORTCUTS_CONFIG.beforeKeydown && SHORTCUTS_CONFIG.beforeKeydown({key: key}) === false) return;

            if (inputFocus && (!SHORTCUTS_CONFIG.beforeInput || SHORTCUTS_CONFIG.beforeInput({key: key}) !== false)) return;

            e.preventDefault();

            SHORTCUTS_EVENT[key] && SHORTCUTS_EVENT[key]({
                key: key
            });
        }
    });
    document.addEventListener('keyup', function(e) {
        switch(e.key) {
        case 'Shift':
            shift = false;
            break;
        case 'Control':
            ctrl = false;
            break;
        case 'Alt':
            alt = false;
            break;
        }
    });
    
    !function poll() {
        inputFocus = (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA');
        setTimeout(poll, 300);
    }();
    
    var handle = {
        config: function(config) {
            for (var i in config) {
                SHORTCUTS_CONFIG[i] = config[i];
            }
            return handle;
        },

        listener: function(key, fun) {
            (typeof key != 'object' ? [key] : key).forEach(function(item) {
                SHORTCUTS_EVENT[item] = fun;
            });

            return handle;
        },
    
        stop: function(key) {
            this.listener(key, null);

            return handle;
        }
    };

    return handle;
})