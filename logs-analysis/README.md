# Logs Analysis Project

This is the 3rd Project of the [Full Stack Web Developer Nanodegree Program](https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004) by **Udacity**.

This project consits of creating a reporting tool that prints out reports (in plain text) based on the data in the database. This reporting tool is a Python program using the psycopg2 module to connect to the database.


## Run the code

  - Install [Python](https://www.postgresql.org/)
  - Install [PostgreSQL](https://www.postgresql.org/)
  - Download the data [here](https://d17h27t6h515a5.cloudfront.net/topher/2016/August/57b5f748_newsdata/newsdata.zip)
  - To load the data, use the command ```psql -d news -f newsdata.sql```.
  - Clone this repository
  - Run the program: ```python logs_analysis_project.py```.


## Program's output
The database contains newspaper articles, as well as the web server log for the site. The log has a database row for each time a reader loaded a web page. Using that information, the code answers 3 questions about the site's user activity:

**1. What are the most popular three articles of all time?**

"Candidate is jerk, alleges rival" - 338647 views

"Bears love berries, alleges bear" - 253801 views

"Bad things gone, say good people" - 170098 views


**2. Who are the most popular article authors of all time?**

"Ursula La Multa" - 507594 views

"Rudolf von Treppenwitz" - 423457 views

"Anonymous Contributor" - 170098 views
"Markoff Chaney" - 84557 views


**3. On which days did more than 1% of requests lead to errors?**

Jul 17, 2016 - 2.3% errors

## News database
This project, works with data that could have come from a real-world web application, with fields representing information that a web server would record, such as HTTP status codes and URL paths. The web server and the reporting tool both connect to the same database, allowing information to flow from the web server into the report.

These are the tables used in the database:
### Articles table
```
CREATE TABLE articles (
    author integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    lead text,
    body text,
    "time" timestamp with time zone DEFAULT now(),
    id integer NOT NULL
);
```
### Authors table
```
CREATE TABLE authors (
    name text NOT NULL,
    bio text,
    id integer NOT NULL
);
```
### Log table
```
CREATE TABLE log (
    path text,
    ip inet,
    method text,
    status text,
    "time" timestamp with time zone DEFAULT now(),
    id integer NOT NULL
);
```
