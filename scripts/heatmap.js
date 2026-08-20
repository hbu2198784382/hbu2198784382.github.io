/* 打卡热力图：拉取 mytodolist 的 dailytasks.json，渲染当月日历热力图
 * 算法：每日强度 = 完成任务 * 0.7 + 未完成任务 * 0.3（不展示任务名称）
 */
(function () {
  'use strict';

  var DATA_URL =
    'https://raw.githubusercontent.com/hbu2198784382/mytodolist/main/dailytasks.json';

  var root = document.getElementById('heatmap');
  if (!root) return;

  var grid = document.getElementById('heatmap-grid');
  var monthEl = document.getElementById('heatmap-month');
  var summaryEl = document.getElementById('heatmap-summary');
  var tooltip = document.getElementById('heatmap-tooltip');

  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var today = now.getDate();

  /* epochDay = 距 1970-01-01 的天数（UTC）。由本地年月日反推 epochDay。 */
  function localToEpochDay(y, m, d) {
    return Math.floor(Date.UTC(y, m, d) / 86400000);
  }

  /* 加权分 → 色阶（0~4） */
  function levelOf(score) {
    if (score <= 0) return 0;
    if (score < 0.7) return 1;
    if (score < 1.4) return 2;
    if (score < 2.1) return 3;
    return 4;
  }

  function setMonthLabel() {
    monthEl.textContent = year + ' 年 ' + (month + 1) + ' 月';
  }

  function positionTooltip(e) {
    var rect = tooltip.getBoundingClientRect();
    var x = e.clientX + 12;
    var y = e.clientY + 12;
    if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - 12;
    if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - 12;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function showTooltip(e, text) {
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    positionTooltip(e);
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  function showError() {
    grid.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'heatmap-error';
    p.textContent = '打卡数据加载失败，请稍后刷新重试。';
    root.appendChild(p);
  }

  function render(completedByDay, incompleteByDay) {
    setMonthLabel();

    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 周一 = 0

    var totalCompleted = 0;
    var totalIncomplete = 0;
    var frag = document.createDocumentFragment();

    /* 月初前的空位 */
    for (var i = 0; i < firstWeekday; i++) {
      var blank = document.createElement('span');
      blank.className = 'heatmap-cell heatmap-blank';
      frag.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const epochDay = localToEpochDay(year, month, day);
      const completed = completedByDay[epochDay] || 0;
      const incomplete = incompleteByDay[epochDay] || 0;
      totalCompleted += completed;
      totalIncomplete += incomplete;

      const score = completed * 0.7 + incomplete * 0.3;
      const cell = document.createElement('span');
      cell.className = 'heatmap-cell heatmap-level-' + levelOf(score);
      cell.setAttribute('role', 'img');
      cell.setAttribute(
        'aria-label',
        month + 1 + '月' + day + '日：完成 ' + completed + '，未完成 ' + incomplete
      );

      if (day === today) {
        cell.classList.add('heatmap-today');
      }

      cell.addEventListener('mouseenter', function (e) {
        var text =
          month + 1 + ' 月 ' + day + ' 日 · 完成 ' + completed + ' / 未完成 ' + incomplete;
        if (completed === 0 && incomplete === 0) {
          text = month + 1 + ' 月 ' + day + ' 日 · 无打卡';
        }
        showTooltip(e, text);
      });
      cell.addEventListener('mousemove', positionTooltip);
      cell.addEventListener('mouseleave', hideTooltip);

      frag.appendChild(cell);
    }

    grid.appendChild(frag);
    summaryEl.textContent =
      '本月完成 ' + totalCompleted + ' 项 · 未完成 ' + totalIncomplete + ' 项';
  }

  setMonthLabel();

  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var tasks = (data && data.tasks) || [];
      var checkins = (data && data.checkins) || [];
      var completedByDay = {};
      var incompleteByDay = {};

      tasks.forEach(function (t) {
        if (typeof t.epochDay !== 'number') return;
        if (t.completed) {
          completedByDay[t.epochDay] = (completedByDay[t.epochDay] || 0) + 1;
        } else {
          incompleteByDay[t.epochDay] = (incompleteByDay[t.epochDay] || 0) + 1;
        }
      });

      checkins.forEach(function (c) {
        if (typeof c.epochDay !== 'number') return;
        completedByDay[c.epochDay] = (completedByDay[c.epochDay] || 0) + 1;
      });

      render(completedByDay, incompleteByDay);
    })
    .catch(showError);
})();
