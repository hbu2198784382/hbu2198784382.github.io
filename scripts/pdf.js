// PDF 在线阅读标签插件
// 用法（在文章 Markdown 中）：
//   {% pdf /pdf/文件名.pdf %}              # 默认 100% x 600px
//   {% pdf /pdf/文件名.pdf 800px %}        # 自定义高度（CSS 值）
// 说明：PDF 文件放到 source/pdf/ 目录下，路径以 /pdf/ 开头。
// 桌面浏览器用内置 PDF 查看器内嵌显示；下方附"新窗口打开"链接，
// 供移动端等无法内嵌渲染的环境使用。
hexo.extend.tag.register('pdf', function (args) {
  var path = args[0];
  var height = args[1] || '600px';
  var width = args[2] || '100%';
  if (!path) {
    return '';
  }
  // 外部绝对地址原样使用；站内路径拼上站根路径
  var url;
  if (/^(https?:)?\/\//.test(path)) {
    url = path;
  } else {
    url = hexo.config.root + String(path).replace(/^\//, '');
  }
  return [
    '<div class="hexo-pdf-container" style="margin:1.5em 0;">',
    '  <iframe src="' + url + '" style="width:' + width + ';height:' + height +
      ';border:none;border-radius:4px;background:#fff;display:block;" allowfullscreen loading="lazy"></iframe>',
    '  <p style="text-align:center;margin:.6em 0 0;font-size:.9em;">',
    '    <a href="' + url + '" target="_blank" rel="noopener">📄 在新窗口打开 PDF</a>',
    '  </p>',
    '</div>'
  ].join('\n');
});
