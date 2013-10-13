#!/usr/bin/env python
import redis

r = redis.StrictRedis(host='localhost', port=6379, db=0)

active_devs = r.get('dc:active')
total_devs = int(r.get('dc:sessionKey'))
total_users = r.get('dc:total_users')
average_users = int(total_users) / float(len(r.keys('dc:*:users')))

speed_keys = r.keys('dc:*:speed')
total_speed = 0
for speedkey in speed_keys:
    total_speed += float(r.get(speedkey))
average_speed = total_speed / float(len(speed_keys))

deploy_keys = r.keys('dc:*:count')
total_deploys = 0
for deploykey in deploy_keys:
    total_deploys += int(r.get(deploykey))
average_deploys = total_deploys / float(len(deploy_keys))

print "status ok Got Deploy Clicker metrics"
print "metric active_devs int", active_devs
print "metric total_devs int", total_devs
print "metric total_users int", total_users
print "metric average_users float", average_users
print "metric total_speed float", total_speed
print "metric average_speed float", average_speed
print "metric total_deploys int", total_deploys
print "metric average_deploys float", average_deploys
