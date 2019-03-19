from flask import Flask, g, render_template, request, redirect
from flask import make_response, jsonify, url_for, flash
from flask import session as login_session
from sqlalchemy import create_engine, asc
from sqlalchemy.orm import sessionmaker
from functools import wraps
from database_setup import User, Base, Category, CatalogItem
import random
import string
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
import httplib2
import json
import requests

app = Flask(__name__)
CLIENT_ID = json.loads(
    open('client_secrets.json', 'r').read())['web']['client_id']
APPLICATION_NAME = "ItemCatalog"

# Connect to Database and create database session
engine = create_engine('sqlite:///catalogitemsandusers.db')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()


# Create anti-forgery state token
@app.route('/login')
def showLogin():
    state = ''.join(
        random.choice(string.ascii_uppercase + string.digits)
            for x in range(32))
    login_session['state'] = state
    # return "The current session state is %s" % login_session['state']
    return render_template('login.html', STATE=state)


# Loggin with Google OAuth2
@app.route('/gconnect', methods=['POST'])
def gconnect():
    # Validate state token
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    # Obtain authorization code
    request.get_data()
    code = request.data.decode('utf-8')

    try:
        # Upgrade the authorization code into a credentials object
        oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Check that the access token is valid.
    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
           % access_token)
    # Submit request, parse response - Python3 compatible
    h = httplib2.Http()
    response = h.request(url, 'GET')[1]
    str_response = response.decode('utf-8')
    result = json.loads(str_response)

    # If there was an error in the access token info, abort.
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(
            json.dumps("Token's client ID does not match app's."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')
    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(
                    json.dumps('Current user is already connected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the access token in the session for later use.
    login_session['access_token'] = access_token
    login_session['gplus_id'] = gplus_id

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)

    data = answer.json()

    login_session['username'] = data['name']
    login_session['picture'] = data['picture']
    login_session['email'] = data['email']

    # see if user exists, if it doesn't make a new one
    user_id = getUserID(login_session['email'])
    if not user_id:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id

    output = ''
    output += '<h1>Welcome, '
    output += login_session['username']
    output += '!</h1>'
    output += '<img src="'
    output += login_session['picture']
    output += ''' " style = "width: 300px; height: 300px;border-radius: 150px;
                -webkit-border-radius: 150px;-moz-border-radius: 150px;"> '''
    flash("you are now logged in as %s" % login_session['username'])
    return output


# User Helper Functions
def createUser(login_session):
    newUser = User(name=login_session['username'], email=login_session[
                   'email'], picture=login_session['picture'])
    session.add(newUser)
    session.commit()
    user = session.query(User).filter_by(email=login_session['email']).one()
    return user.id


def getUserInfo(user_id):
    user = session.query(User).filter_by(id=user_id).one()
    return user


def getUserID(email):
    try:
        user = session.query(User).filter_by(email=email).one()
        return user.id
    except:
        return None


def checkUserLogged():
    username = None
    if 'username' in login_session:
        username = login_session['username']
    return username


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in login_session:
            return redirect(url_for('showLogin'))
        return f(*args, **kwargs)
    return decorated_function


# DISCONNECT - Revoke a current user's token and reset their login_session
@app.route('/gdisconnect')
def gdisconnect():
        # Only disconnect a connected user.
    access_token = login_session.get('access_token')
    if access_token is None:
        response = make_response(
            json.dumps('Current user not connected.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % access_token
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]
    if result['status'] == '200':
        # Reset the user's sesson.
        del login_session['access_token']
        del login_session['gplus_id']
        del login_session['username']
        del login_session['email']
        del login_session['picture']
        response = make_response(json.dumps('Successfully disconnected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return redirect(url_for('showCategories'))
    else:
        # For whatever reason, the given token was invalid.
        response = make_response(
            json.dumps('Failed to revoke token for given user.', 400))
        response.headers['Content-Type'] = 'application/json'
        return response


# JSON APIs to view Category Information
@app.route('/catalog/json')
def categoriesJSON():
    categories = session.query(Category).all()
    categoryList = []
    for category in categories:
        categoryItems = session.query(CatalogItem).filter_by(
                            category_id=category.id).all()
        categoryItemsList = []
        for items in categoryItems:
            categoryItemsList.append(items.serialize)
        category = category.serialize
        category['items'] = categoryItemsList
        categoryList.append(category)
    return jsonify(categories=categoryList)


# Show all categories
@app.route('/', methods=['GET'])
@app.route('/catalog/', methods=['GET'])
def showCategories():
    categories = session.query(Category).order_by(asc(Category.name))
    latest = session.query(CatalogItem).order_by(
                CatalogItem.id.desc()).limit(9)
    return render_template('categoryIndex.html', categories=categories,
                           latest=latest, username=checkUserLogged())


# Show a category
@app.route('/catalog/<string:category_name>/', methods=['GET'])
@app.route('/catalog/<string:category_name>/items/', methods=['GET'])
def showMenu(category_name):
    categories = session.query(Category).order_by(asc(Category.name))
    category = session.query(
            Category).filter_by(name=category_name).one()
    items = session.query(
            CatalogItem).filter_by(category_id=category.id).all()
    username = None
    if 'username' in login_session:
        username = login_session['username']
    return render_template('categoryShow.html', categories=categories,
                           category=category, items=items, username=username)


# Show a category item
@app.route('/catalog/<string:category_name>/<string:catalogitem_title>/',
           methods=['GET'])
def showCatalogItem(category_name, catalogitem_title):
    item = session.query(CatalogItem).filter_by(
                title=catalogitem_title).one()
    return render_template('catalogtemShow.html', item=item,
                           username=checkUserLogged())


# Create a new catalog item
@app.route('/catalog/new/', methods=['GET', 'POST'])
@login_required
def newCatalogItem():
    categories = session.query(Category).order_by(asc(Category.name))
    if request.method == 'POST':
        item = session.query(CatalogItem).filter_by(
                title=request.form['title']).first()
        if not item:
            category = session.query(Category).filter_by(
                        id=request.form['category']).one()
            newCatalogItem = CatalogItem(
                title=request.form['title'],
                description=request.form['description'],
                category=category,
                user_id=login_session['user_id'])
            session.add(newCatalogItem)
            flash('New Catalog Item %s Successfully Created'
                  % newCatalogItem.title)
            session.commit()
            return redirect(url_for('showCatalogItem',
                            category_name=category.name,
                            catalogitem_title=newCatalogItem.title))
        else:
            return render_template('formCatalogItem.html',
                                   isNew=True,
                                   categories=categories,
                                   username=checkUserLogged())
    else:
        return render_template('formCatalogItem.html',
                               isNew=True,
                               categories=categories,
                               username=checkUserLogged())


# Edit a category
@app.route('/catalog/<string:catalogitem_title>/edit/',
           methods=['GET', 'POST'])
@login_required
def editCategory(catalogitem_title):
    editedCategory = session.query(
                        CatalogItem).filter_by(title=catalogitem_title).one()
    if editedCategory.user_id != login_session['user_id']:
        return """<script>function myFunction() {
               alert('You are not authorized to edit this item. Please create your own item in order to edit.');
               }</script><body onload='myFunction()''>"""
    categories = session.query(Category).order_by(asc(Category.name))
    if request.method == 'POST':
        if request.form['title']:
            editedCategory.title = request.form['title']
            editedCategory.description = request.form['description']
            editedCategory.category = session.query(Category).filter_by(
                                      id=request.form['category']).one()
            flash('Category Successfully Edited %s' % editedCategory.title)
            return redirect(url_for('showCategories'))
    else:
        return render_template('formCatalogItem.html',
                               isNew=False,
                               categories=categories,
                               editedCategory=editedCategory,
                               username=checkUserLogged())


# Delete a category
@app.route('/catalog/<string:catalogitem_title>/delete/',
           methods=['GET', 'POST'])
@login_required
def deleteCatalogItem(catalogitem_title):
    catalogItemToDelete = session.query(CatalogItem).filter_by(
                          title=catalogitem_title).one()
    if catalogItemToDelete.user_id != login_session['user_id']:
        return """<script>function myFunction() {
               alert('You are not authorized to delete this item. Please create your own item in order to delete.');
               }</script><body onload='myFunction()''>"""
    if request.method == 'POST':
        session.delete(catalogItemToDelete)
        flash('%s Successfully Deleted' % catalogItemToDelete.title)
        session.commit()
        return redirect(url_for('showCategories'))
    else:
        return render_template('deleteCatalogItem.html',
                               catalogItemToDelete=catalogItemToDelete,
                               username=checkUserLogged())


if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=8000)
