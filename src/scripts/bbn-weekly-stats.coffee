# Description
#   A Hubot script that returns blog.bouzuya.net weekly stats
#
# Configuration:
#   None
#
# Commands:
#   hubot bbn weekly stats - blog.bouzuya.net weekly stats
#
# Author:
#   bouzuya <m@bouzuya.net>
#
module.exports = (robot) ->
  request = require 'request-b'
  moment = require 'moment'

  week = (posts, today) ->
    start = moment(today).startOf('week')
    end = moment(today).endOf('week')
    posts.filter (post) ->
      d = moment(post.date)
      d.isSame(start) or (d.isAfter(start) and d.isBefore(end)) or d.isSame(end)

  stats = (week) ->
    s = week.reduce(((stats, d) ->
      stats.count += 1
      stats.sum += d.minutes
      stats
    ), { count: 0, sum: 0 })
    s.avg = Math.floor(s.sum / s.count)
    s

  weekStats = (posts, today) ->
    stats week(posts, today)

  robot.respond /bbn[ -]weekly[ -]stats/i, (res) ->
    url = 'http://blog.bouzuya.net/posts.json'
    request(url).then (r) ->
      posts = JSON.parse r.body
      today = moment()
      l = weekStats(posts, moment(today).subtract(7, 'days'))
      c = weekStats(posts, today)
      sd = (if c.sum > l.sum then '+' else '') + (c.sum - l.sum)
      ad = (if c.avg > l.avg then '+' else '') + (c.avg - l.avg)
      message = """
        sum: #{l.sum} -> #{c.sum} min (#{sd} min)
        avg: #{l.avg} -> #{c.avg} min (#{ad} min)
      """
      res.send message
