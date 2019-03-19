# Linux Server Configuration Project

This is the 5th Project of the [Full Stack Web Developer Nanodegree Program](https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004) by **Udacity**.

This project consits of taking a baseline installation of a Linux server and prepare it to host your web applications. Server is secured from a number of attack vectors, a database server is installed and configured, and one of the existing web applications deployed onto it.


----------


## Server Info

### Public IP: **34.232.95.236**

### Deployed Item catalog
You can access the WebApp by accessing this link with your browser:
[http://34.232.95.236/](http://34.232.95.236/)

### SSH Access
You can connect to the server via SSH with the following command  (*with the SSH Key provided into the "Notes to Reviewer"*):
```shell
ssh grader@34.232.95.236 -i .ssh/grader_rsa  -p 2200
```
Where:
 - **grader** is a new created user account for this project with permission to sudo.
 - **34.232.95.236** is the public IP for this server.
 - **grader_rsa** is the SSH Key provided into the "Notes to Reviewer".
 - **-p 2200**  is the port configured for ssh connections.


----------


## Software and configurations

### Linux server instance

 - A new Ubuntu Linux server instance was created on [Amazon Lightsail](https://amazonlightsail.com/).
 - Updating Package Lists and Upgrading Installed Packages:

    sudo apt-get update && sudo apt-get upgrade

 - Instance Info: 512 MB RAM, 1 vCPU, 20 GB SSD, Ubuntu 16.04

### Helpufl packages
#### nano
GNU nano is an easy-to-use text editor and can be installed with:
```shell
sudo apt-get install nano
```
#### finger
finger is a user information lookup program and can be installed with:
```shell
sudo apt-get install finger

```
### Web server and Database
#### Apache HTTP Server
Apache HTTP Server, is free and open-source cross-platform web server software. Apache is developed and maintained by an open community of developers under the auspices of the Apache Software Foundation.
```shell
sudo apt-get  install apache2 libapache2-mod-wsgi
```
**Note**: *The mod_wsgi adapter is an Apache module that provides a WSGI (Web Server Gateway Interface, a standard interface between web server software and web applications written in Python)*
#### PostgreSQL
PostgreSQL is an object-relational database management system (ORDBMS) with an emphasis on extensibility and standards compliance. As a database server, its primary functions are to store data securely and return that data in response to requests from other software applications.
```shell
sudo apt-get  install postgresql
```
##### Database user and configuration
Psql is the interactive terminal for working with PostgreSQL:
```shell
psql
```
Database user create and privileges configuration:
```sql
CREATE DATABASE catalogitemsandusers;
CREATE USER catalog WITH PASSWORD '*****';
GRANT ALL PRIVILEGES ON DATABASE catalogitemsandusers TO catalog;
```
#### pip (package manager)
**pip** is a package management system used to install and manage software packages written in Python. Many packages can be found in the Python Package Index (PyPI) including **Flask**, **sqlalchemy** and **oauth2client** required for the Item Catalog.
```shell
sudo apt-get  install python-pip
```
##### Python: Flask
Flask is a micro web framework written in Python. Flask is called a micro framework because it does not require particular tools or libraries.[6] It has no database abstraction layer, form validation, or any other components where pre-existing third-party libraries provide common functions.
```shell
sudo pip install Flask
```
##### Python: SQLAlchemy
SQLAlchemy is an open source SQL toolkit and object-relational mapper (ORM) for the Python programming language released under the MIT License.
```shell
sudo pip install sqlalchemy
```
##### Python: OAuth client
OAuth is an open standard for access delegation, commonly used as a way for Internet users to grant websites or applications access to their information on other websites but without giving them the passwords.
```shell
sudo pip install oauth2client
```
#### Uncomplicated Firewall
Uncomplicated Firewall (UFW) is a program for managing a netfilter firewall designed to be easy to use. It uses a command-line interface consisting of a small number of simple commands, and uses iptables for configuration. UFW is available by default in all Ubuntu installations after 8.04 LTS.
Configured the Uncomplicated Firewall (UFW) to only allow incoming connections for SSH (port 2200), HTTP (port 80), and NTP (port 123).
```shell
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2200/tcp
sudo ufw allow www
sudo ufw allow 123/tcp
sudo ufw enable
```


----------


## Third-party resources
Here are some useful resoures that were used to configure the server and deploy de web app:
- [SQLAlchemy quick start with PostgreSQL](https://suhas.org/sqlalchemy-tutorial/ "SQLAlchemy quick start with PostgreSQL")
- [How To Deploy a Flask Application on an Ubuntu VPS](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-flask-application-on-an-ubuntu-vps "How To Deploy a Flask Application on an Ubuntu VPS")
- [Deploy a Flask Application on Ubuntu 14.04](https://devops.profitbricks.com/tutorials/deploy-a-flask-application-on-ubuntu-1404/ "Deploy a Flask Application on Ubuntu 14.04")
- [SQLAlchemy](https://www.sqlalchemy.org/ "SQLAlchemy")
- [Amazon Lightsail Docs](https://amazonlightsail.com/docs/ "Amazon Lightsail Docs")
