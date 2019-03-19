
### Update and upgrade packages ###

    sudo apt-get update && sudo apt-get upgrade

### Install: nano, finger, aptitude, git, etc ###
    $ sudo apt-get install nano finger aptitude git
    $ sudo aptitude install apache2 libapache2-mod-wsgi python-dev python-pip postgresql

### Clone catalog project ###
    $ cd /var/www/
    $ sudo mkdir catalog
    $ cd catalog/
    $ sudo git clone https://github.com/nitsuga1986/NanodegreeP4Item-Catalog.git
    $ sudo mv NanodegreeP4Item-Catalog/ catalog/
    $ sudo mv application.py __init__.py
    $ sudo pip install virtualenv

### Install python packages ###
    $ sudo virtualenv venv
    $ source venv/bin/activate
    $ sudo pip install Flask psycopg2 sqlalchemy requests
    $ sudo pip install --upgrade oauth2client
    $ sudo python __init__.py
    $ deactivate

### Configure apache ###
    $ sudo nano /etc/apache2/sites-available/catalog.conf


----------


    WSGIPythonPath /var/www/catalog/catalog:/var/www/catalog/catalog/venv/$
    <VirtualHost *:80>
                    ServerName mywebsite.com
                    ServerAdmin admin@mywebsite.com
                    WSGIScriptAlias / /var/www/catalog/catalog.wsgi
                    <Directory /var/www/catalog/catalog/>
                            Order allow,deny
                            Allow from all
                    </Directory>
                    Alias /static /var/www/catalog/catalog/static
                    <Directory /var/www/catalog/catalog/static/>
                            Order allow,deny
                            Allow from all
                    </Directory>
                    ErrorLog ${APACHE_LOG_DIR}/error.log
                    LogLevel warn
                    CustomLog ${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>


----------
    $ sudo a2enmod wsgi
    $ sudo a2dissite 000-default.conf
    $ sudo a2ensite catalog
    $ sudo service apache2 reload
    $ sudo nano catalog.wsgi


----------

    #!/usr/bin/python
    import sys
    import logging
    logging.basicConfig(stream=sys.stderr)
    sys.path.insert(0,"/var/www/catalog/")
    from catalog import app as application

----------

    $ sudo mv catalog/application.py catalog/__init__.py
    $ sudo sed -i 's#sqlite:///catalogitemsandusers.db#postgresql://catalog:catalogpwd@localhost:5432/catalogitemsandusers#g' catalog/__init__.py
    $ sudo sed -i 's#sqlite:///catalogitemsandusers.db#postgresql://catalog:catalogpwd@localhost:5432/catalogitemsandusers#g' catalog/examplecatalog.py
    $ sudo sed -i 's#sqlite:///catalogitemsandusers.db#postgresql://catalog:catalogpwd@localhost:5432/catalogitemsandusers#g' catalog/database_setup.py

### Configure Postgresql ###

    $ sudo su - postgres
    $ psql

    CREATE DATABASE catalogitemsandusers;
    CREATE USER catalog WITH PASSWORD 'catalogpwd';
    GRANT ALL PRIVILEGES ON DATABASE catalogitemsandusers TO catalog;
    \q
    exit

    $ python catalog/examplecatalog.py

### Config SSH: Change port to 2200 ###

    $ sudo nano /etc/ssh/sshd_config
    $ sudo service ssh restart

### Config UFW ###

    $ sudo ufw default deny incoming
    $ sudo ufw default allow outgoing
    $ sudo ufw allow 2200/tcp
    $ sudo ufw allow www
    $ sudo ufw allow 123/tcp
    $ sudo ufw enable
    $ sudo ufw status

### Add User grader ###

    $ sudo adduser grader
    $ sudo cp /etc/sudoers.d/90-cloud-init-users /etc/sudoers.d/grader
    $ sudo nano /etc/sudoers.d/grader
    $ su - grader
    $ ssh-keygen
    $ sudo tail -f /var/log/apache2/error.log







