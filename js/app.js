/**
 * 运行动画
 * @param is 节点
 * @param action 动作(ON,DFF)
 */
function run_animation(is, action) {
    let i = is.getElementsByTagName('span')[0],
        actions = action ? 'add' : 'remove';
    is.classList[actions]('disabled');
    i.classList[actions]('fa-spinner');
    i.classList[actions]('code-icon-spin');
}

/**
 * 运行动画——开
 * @param is 节点
 */
function run_animation_on(is) {
    let i = is.getElementsByTagName('span')[0];
    is.classList.add('disabled');
    i.classList.add('fa-spinner');
    i.classList.add('code-icon-spin');
}

/**
 * 运行动画——关
 * @param is 节点
 */
function run_animation_off(is) {
    let i = is.getElementsByTagName('span')[0];
    is.classList.remove('disabled');
    i.classList.remove('fa-spinner');
    i.classList.remove('code-icon-spin');
}

/**
 * html特定字符转换
 * @param str  需要编码的字符串
 * @returns {string}  编码后的字符串
 */
function encodeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * 遍历数组
 * @param arr       遍历数组
 * @param fn        function
 * @returns {Array}
 */
function map(arr, fn) {
    let res = [], i;
    for (i = 0; i < arr.length; ++i) {
        res.push(fn(arr[i]));
    }
    return res;
}

/**
 * 运行结果展示
 * @param aimdom
 * @param content
 * @param html
 * @param isError
 */
function showcoderesult(aimdom, content, html, isError) {
    let code_result = aimdom.getElementsByClassName('code-result')[0];
    if (code_result === undefined) {
        aimdom.insertAdjacentHTML('beforeend', '<div class="code code-result"></div>');
        code_result = aimdom.getElementsByClassName('code-result')[0];
    }
    code_result.innerHTML = null;
    code_result.insertAdjacentHTML('beforeend', '<a class="close" onclick="levelremove(this, 1)">×</a>');
    code_result.classList.remove('error');
    if (isError) {
        code_result.classList.add('error');
    }
    if (html) {
        code_result.insertAdjacentHTML('beforeend', html);
    }
    if (content) {
        let htm = map(content.split('\n'), function (s) {
            console.log(s);
            return encodeHtml(s).replace(/ /g, '&nbsp;');
        }).join('<br>');
        code_result.insertAdjacentHTML('beforeend', htm);
    } else if (content === '') {
        code_result.insertAdjacentHTML('beforeend', '返回内容为空！');
    }
}

/**
 * AJAX
 * @param opts
 */
function ajax(opts) {
    let defaultOpts = {
        url: '', //ajax 请求地址
        type: 'GET', //请求的方法,默认为GET
        data: null, //请求的数据
        contentType: '', //请求头
        dataType: 'json', //请求的类型,默认为json
        async: true, //是否异步，默认为true
        timeout: 5000, //超时时间，默认5秒钟
        error: function () {
            console.log('error')
        }, //错误执行的函数
        success: function () {
            console.log('success')
        } //请求成功的回调函数
    };

    for (let i in defaultOpts) {
        if (opts[i] === undefined) {
            opts[i] = defaultOpts[i];
        }
    }
    let xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                opts.success(JSON.parse(xmlhttp.responseText));
            } else {
                opts.error(xmlhttp.status);
            }
        }
    };
    xmlhttp.open(opts.type, opts.url, opts.async);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(opts.data);
}

/**
 * 发送代码
 * @param is
 * @param coderoot
 * @param code
 */
function sendcode(is, coderoot, code) {
    run_animation(is, true);
    ajax({
        type: 'post',
        url: 'https://localhost:39093/run',
        data: 'code=' + code,
        success: function (result) {
            if (result.error) {
                showcoderesult(coderoot, result.output, 'Error:' + result.error + '\n' + result.output, true);
            } else {
                showcoderesult(coderoot, result.output);
            }
            run_animation(is, false);
        },
        error: function (status) {
            showcoderesult(coderoot, null, '<p>Error:返回错误</p><p>Status:' + status + '</p><p>无法连接到Python代码运行助手。请检查<a target="_blank" href="#">本机的设置</a>。</p>', true);
            console.log();
            run_animation(is, false);
        }
    });
}

/**
 *  返回代码块节点
 * @param coderoot  代码块根节点
 * @returns {HTMLTextAreaElement}  代码块节点
 */
function getcode(coderoot) {
    return coderoot.getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0];
}

/**
 * 代码块运行
 * @param is
 */
function execute_python(is) {
    let coderoot = getlevel(is, 4),
        code = getcode(coderoot).value;
    if (code === "") {
        showcoderesult(coderoot, null, '<p>无可运行代码!</p>', true);
        return;
    }
    console.log(code);
    sendcode(is, coderoot, code);
}

/**
 * 所有代码运行
 * @param is
 */
function all_execute_python(is) {
    let root = getlevel(is, 2),
        codes = document.getElementsByTagName("textarea"),
        code = '';
    for (let i = 0; i < codes.length; i++) {
        if (codes[i].className.indexOf('run') !== -1) {
            code += codes[i].value + '\n';
        }
    }
    if (code === "") {
        showcoderesult(root, null, '<p>无可运行代码!</p>', true);
        return;
    }
    sendcode(is, root, code);
}

/**
 * 添加代码块
 */
let runtag = null;

function addrows() {
    alerttext('添加代码块', 0.8);
    runtag += 1;
    let content = "";
    content += "    <div id=\"code-" + runtag + "\" class=\"box codes\">";
    content += "        <div class=\"box-header\" ondrop=\"drop(event,this)\" ondragover=\"allowDrop(event)\" draggable=\"true\"";
    content += "             ondragstart=\"drag(event, this)\">";
    content += "            <div class=\"text-info\">";
    content += "                <span>#  code-" + runtag + "<\/span>";
    content += "                <span class=\"info-divider\"><\/span>";
    content += "                <span>1 lines (20 len)<\/span>";
    content += "                <span class=\"info-divider\"><\/span>";
    content += "                <span>20 Bytes<\/span>";
    content += "            <\/div>";
    content += "            <div class=\"function-group\">";
    content += "                <div class=\"btngroup\">";
    content += "                    <button class=\"btn btn-sm btngroup-item\" href=\"javascript:void(0);\" title=\"关闭\"";
    content += "                            onclick=\"toggle(this)\">";
    content += "                        <span class=\"toggle toggle-on\"><\/span>";
    content += "                    <\/button>";
    content += "                    <a class=\"btn btn-sm btngroup-item\" href=\"javascript:void(0);\" title=\"运行\"";
    content += "                       onclick=\"execute_python(this)\">";
    content += "                        <span class=\"fa fa-play\" aria-hidden=\"true\"><\/span>";
    content += "                    <\/a>";
    content += "                    <a class=\"btn btn-sm btngroup-item\" href=\"javascript:void(0);\" title=\"复制\" onclick=\"copycode(this)\">";
    content += "                        <span class=\"fa fa fa-copy\" aria-hidden=\"true\"><\/span>";
    content += "                    <\/a>";
    content += "                    <a class=\"btn btn-sm btngroup-item\" href=\"javascript:void(0);\" title=\"保存\" onclick=\"savecode(this)\">";
    content += "                        <span class=\"fa fa-floppy-o\" aria-hidden=\"true\"><\/span>";
    content += "                    <\/a>";
    content += "                    <a class=\"btn btn-sm btngroup-item\" href=\"javascript:void(0);\" title=\"向上合并\" onclick=\"upmerge(this)\">";
    content += "                        <span class=\"fa fa-long-arrow-up\" aria-hidden=\"true\"><\/span>";
    content += "                    <\/a>";
    content += "                    <a class=\"btn btn-sm btngroup-item\" href=\"javascript:void(0);\" title=\"向下合并\"";
    content += "                       onclick=\"downmerge(this)\">";
    content += "                        <span class=\"fa fa-long-arrow-down\" aria-hidden=\"true\"><\/span>";
    content += "                    <\/a>";
    content += "                    <a class=\"btn btn-sm btngroup-item\" href=\"javascript:void(0);\" title=\"删除\"";
    content += "                       onclick=\"delectcode(this)\">";
    content += "                        <span class=\"fa fa-trash\" aria-hidden=\"true\"><\/span>";
    content += "                    <\/a>";
    content += "                <\/div>";
    content += "            <\/div>";
    content += "        <\/div>";
    content += "        <div class=\"box-body\">";
    content += "            <textarea onkeyup=\"AutoTextareaHeight(this)\" class=\"run\" rows=\"6\">print('Hello Word!')<\/textarea>";
    content += "        <\/div>";
    content += "    <\/div>";


    document.getElementById("app").insertAdjacentHTML("beforeend", content);
}

/**
 * 获取层次节点
 */
function getlevel(is, level) {
    if (level >= 0) {
        // console.log(level);
        for (let i = 0; i < level; i++) {
            is = is.parentNode;
        }
    }
    return is
}

/**
 * 删除当前节点
 */
function removethis(is) {
    is.parentNode.removeChild(is);

}

/**
 * 删除层次节点
 */
function levelremove(is, level) {
    is = getlevel(is, level);
    removethis(is);
}

/**
 * 删除代码块
 */
function removecode(is) {
    let code_root = getlevel(is, 4);
    removethis(code_root);
}

/**
 * Textarea高度自适应
 */
function AutoTextareaHeight(t) {
    // console.log(t.value.length);
    // let
    //     $t = $(t),
    //     lines = $t.val().split('\n').length;
    // console.log(lines);
    // if (lines < 5) {
    //     lines = 5;
    // } else {
    // }
    // $t.attr('rows', '' + (lines + 1));

    console.log(t.value);
    let
        length = t.value.length,
        lines = t.value.split('\n').length,
        bytes = countbytes(t.value);
    setcodeinfo(lines, length, bytes, t);
    if (lines < 5) {
        lines = 5;
    } else {
    }
    t.rows = lines + 1;
    t.innerHTML = t.value;
}

/**
 * 设置code信息
 */
function setcodeinfo(lines, length, bytes, is) {
    console.log(lines, length, bytes);
    let info_list = is.parentNode.previousElementSibling.firstElementChild.children;
    info_list[2].innerHTML = lines + " lines (" + length + " len)";
    info_list[4].innerHTML = bytes + " Bytes";
}

/**
 * 字符串统计字节数
 */
function countbytes(str) {
    let bytesCount = 0;
    for (let i = 0; i < str.length; i++) {
        let c = str.charAt(i);
        //匹配双字节
        if (/^[\u0000-\u00ff]$/.test(c)) {
            bytesCount += 1;
        } else {
            bytesCount += 2;
        }
    }
    return bytesCount;
}

/**
 * 代码运行开关
 * 已弃置
 */
function codeswitch(is) {
    let codetag = is.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0];


    if (is.previousElementSibling.checked) {
        console.log("在ON的状态下");
        codetag.classList.remove('run');
        is.title = "开启";

    } else {
        console.log("在OFF的状态下");
        codetag.classList.add('run');
        is.title = "关闭";
    }
}

/**
 * 代码运行开关切换
 * @param is 当前节点
 */
function toggle(is) {
    let codetag = getlevel(is, 4).getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0],
        icon = is.getElementsByTagName('span')[0];
    toggleClass(icon, 'toggle-on');
    toggleClass(icon, 'toggle-off');
    icon.classList.add('toggle-moving');
    setTimeout(function () {
        icon.classList.remove('toggle-moving');
    }, 200);
    if (hasClass(icon, 'toggle-on')) {
        log("在ON的状态下");
        codetag.classList.add('run');
        is.title = "关闭";

    }
    if (hasClass(icon, 'toggle-off')) {
        log("在OFF的状态下");
        codetag.classList.remove('run');
        is.title = "开启";
    }
}

/**
 * 当前块代码保存为文件
 * @param is 当前节点
 */
function savecode(is) {
    let code = is.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0].value,
        FileName = is.parentNode.parentNode.parentNode.parentNode.id + '.py';
    console.log('保存文件名：' + FileName);
    console.log('保存代码：' + code);
    let downLink = document.createElement('a');
    downLink.download = FileName;
    //字符内容转换为blod地址
    let blob = new Blob([code]);
    downLink.href = URL.createObjectURL(blob);
    // 链接插入到页面
    document.body.appendChild(downLink);
    downLink.click();
    // 移除下载链接
    document.body.removeChild(downLink);
}

/**
 * 向上合并
 * @param is
 */
function upmerge(is) {
    let code_root = is.parentNode.parentNode.parentNode.parentNode;
    if (code_root.previousElementSibling == null) {
        alert("该代码块是首个代码块，无可合并代码块！")
    }
    let code_id = code_root.id,
        code = code_root.getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0].value,
        aimtext = code_root.previousElementSibling.getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0];
    aimtext.value += "\n\n#  " + code_id + "\n" + code;
    AutoTextareaHeight(aimtext);
    removecode(is);
}

/***
 * 向下合并
 * @param is
 */
function downmerge(is) {
    let code_root = is.parentNode.parentNode.parentNode.parentNode;
    if (code_root.nextElementSibling == null) {
        alert("该代码块是末尾代码块，无可合并代码块！")
    }
    let code_id = code_root.id,
        code = code_root.getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0].value,
        aimtext = code_root.nextElementSibling.getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0];
    aimtext.value += "\n\n#  " + code_id + "\n" + code;
    AutoTextareaHeight(aimtext);
    removecode(is);
}

/**
 * 拖放
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * 深复制
 * @param obj  需要复制的对象
 * @returns {array}  复制的对象
 */
function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

let dragdom = null;

/**
 * 拖动
 * @param ev event
 * @param is 当前节点
 */
function drag(ev, is) {
    dragdom = is.parentNode;
}

/**
 * 放置
 * @param ev event
 * @param is 当前节点
 */
function drop(ev, is) {
    ev.preventDefault();
    let dropdom = is.parentNode;
    if (dragdom !== dropdom) {
        dragdom.parentNode.replaceChild(dragdom.cloneNode(true), dropdom);
        dragdom.parentNode.replaceChild(dropdom.cloneNode(true), dragdom);
    }
}

/**
 * 判断是否存在class
 * @param obj DOM节点
 * @param cls class
 * @returns {boolean} Boolean
 */
function hasClass(obj, cls) {
    return obj.classList.contains(cls);
}

/**
 * 打印日志
 * @param obj Object
 */
function log(obj) {
    console.log(obj);
}

/**
 * 切换class,存在则删除,不存在则添加
 * @param obj
 * @param cls
 */
function toggleClass(obj, cls) {
    hasClass(obj, cls) ? obj.classList.remove(cls) : obj.classList.add(cls);
}

/**
 * 代码复制
 * @param is
 */
function copycode(is) {
    let codetag = getlevel(is, 4).getElementsByClassName('box-body')[0].getElementsByTagName('textarea')[0];
    let copy = document.createElement("textarea");
    copy.style.cssText = "position: fixed;z-index: -10;top: -50px;left: -50px;";
    copy.innerHTML = codetag.innerHTML;
    document.getElementsByTagName("body")[0].appendChild(copy);
    copy.select();
    document.execCommand("copy");
    removethis(copy);
    alerttext('复制成功!');
    // if (!(codetag !== undefined && codetag !== null)) return Promise.resolve(0);
    // // 如果支持 select 就使用
    // if (codetag.select) {
    //     codetag.select();
    // } else {
    //     let selection = window.getSelection();
    //     let createRange = document.createRange();
    //     createRange.selectNodeContents(codetag);
    //     selection.removeAllRanges();
    //     selection.addRange(createRange);
    // }
    // return new Promise((resolve) => {
    //     try {
    //         if (document.execCommand('copy', false, null)) {
    //             document.execCommand("Copy");
    //             resolve(1);
    //         } else {
    //             resolve(0);
    //         }
    //     } catch (err) {
    //         resolve(0);
    //     }
    // });


    // if (140 < window.getSelection().getRangeAt(0).toString().length) {
    //     let e;
    //     t.preventDefault(), e = window.getSelection() + n.textData;
    //     window.getSelection(), n.htmlData;
    //     if (t.clipboardData) t.clipboardData.setData("text/plain", e); else {
    //         if (window.clipboardData) return window.clipboardData.setData("text", e);
    //         !function (t) {
    //             var e = document.createElement("textarea");
    //             e.style.cssText = "position: fixed;z-index: -10;top: -50px;left: -50px;", e.innerHTML = t, document.getElementsByTagName("body")[0].appendChild(e), e.select(), document.execCommand("copy")
    //         }(e)
    //     }
    // }
}

/**
 * 提示框,延时消失
 * @param text 弹出内容
 * @param time 延时(s)
 * @param state 状态(css)
 * @param isdelete 是否自动删除
 */
function alerttext(text, time = 0.5, state, isdelete = true) {
    let alert = document.createElement("div");
    alert.classList.add('alert');
    if (state !== null && state !== undefined) alert.classList.add('alert-' + state); else alert.classList.add('alert-info');
    let style = {
            position: 'fixed',
            zIndex: '9999',
            margin: '0 auto',
            top: '10%',
            width: '250px',
            left: '0px',
            right: '0px',
            opacity: .5,
            textAlign: "center",
            transition: 'all 200ms ease'
        }
    ;
    for (let i in style)
        alert.style[i] = style[i];
    alert.innerHTML = text;
    document.body.appendChild(alert);
    setTimeout(function () {
        alert.style.opacity = '1';
    }, 1);

    if (isdelete) {
        setTimeout(function () {
            alert.style.transition = 'all 500ms ease';
            alert.style.top = '0px';
            alert.style.opacity = '0';
        }, time * 1000 + 201);
        setTimeout(function () {
            document.body.removeChild(alert);
        }, time * 1000 + 701);
    } else {
        let close = document.createElement("span");
        close.classList.add('close');
        close.setAttribute('onclick', 'levelremove(this, 1)');
        close.innerHTML = '×';
        alert.appendChild(close);
    }
}

/**
 * 确认框,confirm
 * @param opts 参数对象
 */
function confirm(opts) {
    let defaultopts = {
        this: null,
        title: '请再次确认',
        info: '您的操作可能会造成无法挽回的后果,\n出于谨慎考虑,请您再次确认。',
        yestext: '确定',
        notext: '取消',
        yes: function () {
            log('Yes!');
        },
        no: function () {
            log('No!!');
        }
    };

    for (let i in defaultopts) {
        if (opts[i] === undefined) {
            opts[i] = defaultopts[i];
        }
    }

    let confirm = {};
    confirm.confirm = document.createElement("div");
    confirm.content = document.createElement("div");
    confirm.header = document.createElement("div");
    confirm.body = document.createElement("div");
    confirm.footer = document.createElement("div");
    confirm.yes = document.createElement("div");
    confirm.no = document.createElement("div");
    confirm.close = document.createElement("span");

    confirm.confirm.id = 'confirm';
    confirm.confirm.classList.add('confirm');
    confirm.content.classList.add('content');
    confirm.header.classList.add('confirm-header');
    confirm.body.classList.add('confirm-body');
    confirm.footer.classList.add('confirm-footer');
    confirm.yes.classList.add('confirm-yes');
    confirm.no.classList.add('confirm-no');
    confirm.close.classList.add('close');

    confirm.header.innerHTML = opts.title;
    confirm.close.innerHTML = '×';
    confirm.close.setAttribute('onclick', 'levelremove(this, 3)');
    confirm.header.appendChild(confirm.close);

    let info = opts.info.split('\n');
    for (let num in info) {
        let p = document.createElement("p");
        p.innerHTML = encodeHtml(info[num]).replace(/ /g, '&nbsp;');
        confirm.body.appendChild(p);
    }

    confirm.yes.innerHTML = opts.yestext;
    confirm.no.innerHTML = opts.notext;
    confirm.footer.appendChild(confirm.yes);
    confirm.footer.appendChild(confirm.no);

    confirm.content.appendChild(confirm.header);
    confirm.content.appendChild(confirm.body);
    confirm.content.appendChild(confirm.footer);

    confirm.confirm.appendChild(confirm.content);
    confirm.confirm.style.display = 'block';
    document.body.appendChild(confirm.confirm);


    document.getElementById('confirm').getElementsByClassName('confirm-yes')[0].onclick = function () {
        document.body.removeChild(confirm.confirm);
        setTimeout(function () {
            opts.yes();
        }, 200);

    };
    document.getElementById('confirm').getElementsByClassName('confirm-no')[0].onclick = function () {
        document.body.removeChild(confirm.confirm);
        setTimeout(function () {
            opts.no();
        }, 200);
    };
}

/**
 * 删除代码块,需确认
 * @param is
 */
function delectcode(is) {
    confirm({
        this: is,
        title: '删除确认',
        info: '您的操作可能会造成无法挽回的后果,\n出于谨慎考虑,请您再次确认。',
        yestext: '确定',
        notext: '取消',
        yes: function () {
            levelremove(is, 4);
            alerttext('删除成功!');
        },
        no: function () {
        }
    });
}