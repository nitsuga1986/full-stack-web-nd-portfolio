from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database_setup import User, Base, Category, CatalogItem

engine = create_engine('sqlite:///catalogitemsandusers.db')
# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object. Any change made against the objects in the
# session won't be persisted into the database until you call
# session.commit(). If you're not happy about the changes, you can
# revert all of them back to the last commit by calling
# session.rollback()
session = DBSession()


# Create dummy user
User1 = User(name="Frodo Baggins", email="frodo_baggins@udacity.com",
             picture='https://vignette1.wikia.nocookie.net/eldragonverde/images/8/86/Frodo.png/revision/latest?cb=20130111173851&path-prefix=es')
session.add(User1)
session.commit()

# Add Categories
category1 = Category(name="Soccer")
session.add(category1)
session.commit()

category2 = Category(name="Basketball")
session.add(category2)
session.commit()

category3 = Category(name="Baseball")
session.add(category3)
session.commit()

category4 = Category(name="Frisbee")
session.add(category4)
session.commit()

category5 = Category(name="Snowboarding")
session.add(category5)
session.commit()

category6 = Category(name="Rock Climbing")
session.add(category6)
session.commit()

category7 = Category(name="Foosball")
session.add(category7)
session.commit()

category8 = Category(name="Skating")
session.add(category8)
session.commit()

category9 = Category(name="Hockey")
session.add(category9)
session.commit()

print "Categories added!"


# Add Items
catalogitem1 = CatalogItem(title="Soccer Cleats", category=category1, user=User1,
                        description="First off, let s break down the parts of a soccer shoe.")
session.add(catalogitem1)
session.commit()

catalogitem2 = CatalogItem(title="Jersey", category=category1, user=User1,
                        description="Customizable fan jerseys in every size from your favorite squads from around the world.")
session.add(catalogitem2)
session.commit()

catalogitem3 = CatalogItem(title="Bat", category=category3, user=User1,
                        description="Composite wooden discovery bat for beginners and children for use with a soft ball.")
session.add(catalogitem3)
session.commit()

catalogitem4 = CatalogItem(title="Frisbee", category=category4, user=User1,
                        description="Aggressive into the wind, Hornet's place in the hive is between Wasp and Drone.")
session.add(catalogitem4)
session.commit()

catalogitem5 = CatalogItem(title="Shinguards", category=category1, user=User1,
                        description="A revolution in protection, G-Form is the world's first soft, flexible, sleeve-style.")
session.add(catalogitem5)
session.commit()

catalogitem6 = CatalogItem(title="Two shinguards", category=category1, user=User1,
                        description="A revolution in protection, G-Form is the world's first soft, flexible, sleeve-style.")
session.add(catalogitem6)
session.commit()

catalogitem7 = CatalogItem(title="Snowboard", category=category5, user=User1,
                        description="Redesigned with 100% classic camber.")
session.add(catalogitem7)
session.commit()

catalogitem8 = CatalogItem(title="Googles", category=category9, user=User1,
                        description="With a cylindrical style design, we were able to pull the goggle in closer to your face than ever before.")
session.add(catalogitem8)
session.commit()

catalogitem9 = CatalogItem(title="Stick", category=category5, user=User1,
                        description="The vented polymer blade is designed to take high-impact hits, and it's connected to a poplar/birch shaft.")
session.add(catalogitem9)
session.commit()

print "Items added!"
