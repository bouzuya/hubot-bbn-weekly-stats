// Description
//   A Hubot script that returns blog.bouzuya.net weekly stats
//
// Configuration:
//   None
//
// Commands:
//   hubot bbn weekly stats - blog.bouzuya.net weekly stats
//
// Author:
//   bouzuya <m@bouzuya.net>
//
module.exports = function(robot) {
  var moment, request, stats, week, weekStats;
  request = require('request-b');
  moment = require('moment');
  week = function(posts, today) {
    var end, start;
    start = moment(today).startOf('week');
    end = moment(today).endOf('week');
    return posts.filter(function(post) {
      var d;
      d = moment(post.date);
      return d.isSame(start) || (d.isAfter(start) && d.isBefore(end)) || d.isSame(end);
    });
  };
  stats = function(week) {
    var s;
    s = week.reduce((function(stats, d) {
      stats.count += 1;
      stats.sum += d.minutes;
      return stats;
    }), {
      count: 0,
      sum: 0
    });
    s.avg = Math.floor(s.sum / s.count);
    return s;
  };
  weekStats = function(posts, today) {
    return stats(week(posts, today));
  };
  return robot.respond(/bbn[ -]weekly[ -]stats/i, function(res) {
    var url;
    url = 'http://blog.bouzuya.net/posts.json';
    return request(url).then(function(r) {
      var ad, c, l, message, posts, sd, today;
      posts = JSON.parse(r.body);
      today = moment();
      l = weekStats(posts, moment(today).subtract(7, 'days'));
      c = weekStats(posts, today);
      sd = (c.sum > l.sum ? '+' : '') + (c.sum - l.sum);
      ad = (c.avg > l.avg ? '+' : '') + (c.avg - l.avg);
      message = "sum: " + l.sum + " -> " + c.sum + " min (" + sd + " min)\navg: " + l.avg + " -> " + c.avg + " min (" + ad + " min)";
      return res.send(message);
    });
  });
};
