﻿layui.config({
    base: '/lib/winui/', //指定 winui 路径
    dir: '/lib/layui/'
    , version: '1.0.0-betaindex'
}).extend({  //指定js别名
    window: 'js/winui.window',
    desktop: 'js/winui.desktop',
    start: 'js/winui.start',
    helper: 'js/winui.helper'
}).define(['window', 'desktop', 'start', 'helper'], function (exports) {
    var $ = layui.jquery;

    $(function () {
        winui.window.msg('Welcome To Renren Tools Backend', {
            time: 4500,
            offset: '40px',
            btn: ['点击进入全屏'],
            btnAlign: 'c',
            yes: function (index) {
                winui.fullScreen(document.documentElement);
                layer.close(index);
            }
        });

        //winui.window.open({
        //    id: '公告',
        //    type: 1,
        //    title: '演示公告',
        //    content: '<p style="padding:20px;">半成品仅供参观，多数设置本地存储，清除浏览器缓存即失效。<br/><br/>慢工出细活，如有需要的朋友请耐心等待。<br/><br/>望社区案例多多点赞，谢谢各位！<br/><br/>特色很多，如：<span style="color:#FF5722">桌面助手，主题设置</span>，大家慢慢参观</p>',
        //    area: ['400px', '400px']
        //});

        winui.config({
            settings: layui.data('winui').settings || {
                color: 32,
                taskbarMode: 'bottom',
                startSize: 'sm',
                bgSrc: '/images/bg_01.jpg',
                lockBgSrc: '/images/bg_04.jpg'
            },  //如果本地配置为空则给默认值
            desktop: {
                options: {},    //可以为{}  默认 请求 json/desktopmenu.json
                done: function (desktopApp) {
                    desktopApp.ondblclick(function (id, elem) {
                        OpenWindow(elem);
                    });
                    desktopApp.mouseover(function (id, elem) {
                            layer.tips('双击打开',elem,{time:3000});
                        }
                    );
                    desktopApp.contextmenu({
                        item: ["打开", "删除", '右键菜单可自定义'],
                        item1: function (id, elem) {
                            OpenWindow(elem);
                        },
                        item2: function (id, elem, events) {
                            winui.window.msg('删除回调');
                            $(elem).remove();
                            //从新排列桌面app
                            events.reLocaApp();
                        },
                        item3: function (id, elem, events) {
                            winui.window.msg('自定义回调');
                        }
                    });
                }
            },
            menu: {
                options: {
                    url: '/getMenus/0',
                    method: 'get'
                },
                done: function (menuItem) {
                    //监听开始菜单点击
                    menuItem.onclick(function (elem) {
                        OpenWindow(elem);
                    });
                    menuItem.contextmenu({
                        item: [{
                            icon: 'fa-cog'
                            , text: '设置'
                        }, {
                            icon: 'fa-close'
                            , text: '关闭'
                        }, {
                            icon: 'fa-qq'
                            , text: '右键菜单可自定义'
                        }],
                        item1: function (id, elem) {
                            //设置回调
                            console.log(id);
                            console.log(elem);
                        },
                        item2: function (id, elem) {
                            //关闭回调
                        },
                        item3: function (id, elem) {
                            winui.window.msg('自定义回调');
                        }
                    });
                }
            }
        }).init({
            audioPlay: false, //是否播放音乐（开机音乐只会播放一次，第二次播放需要关闭当前页面从新打开，刷新无用）
            renderBg: true //是否渲染背景图 （由于js是写在页面底部，所以不太推荐使用这个来渲染，背景图应写在css或者页面头部的时候就开始加载）
        }, function () {
            //初始化完毕回调
        });
    });

    //开始菜单磁贴点击
    $('.winui-tile').on('click', function () {
        OpenWindow(this);
    });

    //开始菜单左侧主题按钮点击
    $('.winui-start-item.winui-start-individuation').on('click', function () {
        winui.window.openTheme();
    });

    //打开窗口的方法（可自己根据需求来写）
    function OpenWindow(menuItem) {
        var $this = $(menuItem);

        var url = $this.attr('win-url');
        var title = $this.attr('win-title');
        var id = $this.attr('win-id');
        var type = parseInt($this.attr('win-opentype'));
        var maxOpen = parseInt($this.attr('win-maxopen')) || -1;
        if (url == 'theme') {
            winui.window.openTheme();
            return;
        }
        if (!url || !title || (!id && type != 3)) {
            winui.window.msg('菜单配置错误（菜单链接、标题、id缺一不可）');
            return;
        }

        var content;
        if (type === 1) {
            $.ajax({
                type: 'get',
                url: url,
                async: false,
                success: function (data) {
                    content = data;
                },
                error: function (e) {
                    var page = '';
                    switch (e.status) {
                        case 404:
                            page = '404';
                            break;
                        case 500:
                            page = '500';
                            break;
                        default:
                            content = "打开窗口失败";
                    }
                    $.ajax({
                        type: 'get',
                        url: '/winUi/error' + page,
                        async: false,
                        success: function (data) {
                            content = data;
                        },
                        error: function () {
                            layer.close(load);
                        }
                    });
                }
            });
        } else
        if(type == 3){
            window.open(url);
            return;
        } else {
            content = url;
        }
        //核心方法（参数请看文档，config是全局配置 open是本次窗口配置 open优先级大于config）
        winui.window.config({
            anim: 0,
            miniAnim: 0,
            maxOpen: -1
        }).open({
            id: id,
            type: type,
            title: title,
            content: content
            //,area: ['70vw','80vh']
            //,offset: ['10vh', '15vw']
            , maxOpen: maxOpen
            //, max: false
            //, min: false
            //, refresh:true
        });
    }

    //注销登录
    $('.logout').on('click', function () {
        winui.hideStartMenu();
        winui.window.confirm('确认注销吗?', { icon: 3, title: '提示' }, function (index) {
            winui.window.msg('执行注销操作，返回登录界面');
            layer.close(index);
            window.location = "/logout";
        });
    });

    //开始菜单用户中心
    $('.user-center').on('click', function () {
        OpenWindow(this);
    });

    //开始菜单主题设置按钮
    $('.theme-setting').on('click', function () {
        winui.window.Open();
    });


    // 判断是否显示锁屏（这个要放在最后执行）
    if (window.localStorage.getItem("lockscreen") == "true") {
        winui.lockScreen(function (password) {
            var result = 0;
            //解锁验证
            $.ajax({
                type: 'post',
                url: '/unLockScreen',
                data:{ 'password':password },
                async: false,
                success: function (data) {
                    if (data === 'success') {
                        result = 1;
                    }
                },
                error: function () {
                    layer.close(load);
                }
            });

            if (result == 1) {
                return true;
            } else {
                winui.window.msg('密码错误', { shift: 6 });
                return false;
            }

        });
    }

    //扩展桌面助手工具
    winui.helper.addTool([{
        tips: '锁屏',
        icon: 'fa-power-off',
        click: function (e) {
            winui.lockScreen(function (password) {
                var result = 0;
                //解锁验证
                $.ajax({
                    type: 'post',
                    url: '/unLockScreen',
                    data:{ 'password':password },
                    async: false,
                    success: function (data) {
                        if (data === 'success') {
                            result = 1;
                        }
                    },
                    error: function () {
                        layer.close(load);
                    }


                });

                if (result == 1) {
                    return true;
                } else {
                    winui.window.msg('密码错误', { shift: 6 });
                    return false;
                }
            });
        }
    }, {
        tips: '切换壁纸',
        icon: 'fa-television',
        click: function (e) {
            layer.msg('这个是自定义的工具栏', { zIndex: layer.zIndex });
        }
    }]);

    exports('index', {});
});