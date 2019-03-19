#!/usr/bin/env python2.7
import psycopg2

# Connect to the news database.
db = psycopg2.connect("dbname=news user=vagrant")
c = db.cursor()

# 1. What are the most popular three articles of all time?
query_01 = """
SELECT articles.title, count(*) AS views
FROM articles JOIN log
ON ('/article/' || articles.slug) = log.path
GROUP BY articles.id
ORDER BY views DESC
LIMIT 3;
;"""
c.execute(query_01)
results_01 = c.fetchall()
# Print results query_01
print "1. What are the most popular three articles of all time?"
for result in results_01:
    print '"{0}" - {1} views'.format(result[0], result[1])
print

# 2. Who are the most popular article authors of all time?
query_02 = """
SELECT authored_articles.name, count(*) AS views
FROM
(SELECT authors.name, articles.slug
FROM articles, authors
WHERE articles.author =  authors.id) AS authored_articles
JOIN log
ON ('/article/' || authored_articles.slug) = log.path
GROUP BY authored_articles.name
ORDER BY views DESC;
;"""
c.execute(query_02)
results_02 = c.fetchall()
# Print results query_02
print "2. Who are the most popular article authors of all time?"
for result in results_02:
    print '"{0}" - {1} views'.format(result[0], result[1])
print

# 3. On which days did more than 1% of requests lead to errors?
query_03 = """
SELECT log.time::date,
(count(CASE WHEN log.status = '404 NOT FOUND' THEN 1 END)*100)::numeric/
count(*)
FROM log
GROUP BY log.time::date
HAVING
(count(CASE WHEN log.status = '404 NOT FOUND' THEN 1 END)*100)::numeric/
count(*) > 1;
;"""
c.execute(query_03)
results_03 = c.fetchall()
# Print results query_03
print "3. On which days did more than 1% of requests lead to errors?"
for result in results_03:
    print (result[0].strftime('%b %d, %Y') +
           ' - ' + '%.1f' % result[1] + '% errors')

# Close connection to database.
db.close()
