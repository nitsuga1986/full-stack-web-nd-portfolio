import media
import movies_website

# The Matrix: title, year, sotryline, poster image and trailer
the_matrix = media.Movie(
    "The Matrix",
    "1999",
    "A computer hacker learns from mysterious rebels about the true nature of"
    "his reality and his role in the war against its controllers.",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SY1000_CR0,0,665,1000_AL_.jpg",  # NOQA
    "https://youtu.be/tGgCqGm_6Hs"
    )

# The Dark Knight: title, year, sotryline, poster image and trailer
the_dark_knight = media.Movie(
    "The Dark Knight",
    "2008",
    "When the menace known as the Joker wreaks havoc and chaos on the people"
    "of Gotham, the Dark Knight must come to terms with one of the greatest"
    "psychological tests of his ability to fight injustice.",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SY1000_CR0,0,675,1000_AL_.jpg",  # NOQA
    "https://youtu.be/_PZpmTj1Q8Q"
    )

# Schindler's List: title, year, sotryline, poster image and trailer
schindler_list = media.Movie(
    "Schindler's List",
    "1993",
    "In German-occupied Poland during World War II, Oskar Schindler gradually"
    "becomes concerned for his Jewish workforce after witnessing their"
    "persecution by the Nazi Germans.",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SY1000_CR0,0,666,1000_AL_.jpg",  # NOQA
    "https://youtu.be/iarykvuRCkc"
    )

# The Matrix: title, year, sotryline, poster image and trailer
pulp_fiction = media.Movie(
    "Pulp Fiction",
    "1994",
    "The lives of two mob hit men, a boxer, a gangster's wife, and a pair of"
    "diner bandits intertwine in four tales of violence and redemption.",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BMTkxMTA5OTAzMl5BMl5BanBnXkFtZTgwNjA5MDc3NjE@._V1_SY1000_CR0,0,673,1000_AL_.jpg",  # NOQA
    "https://youtu.be/s7EdQ4FqbhY"
    )

# The Lord of the Rings I: title, year, sotryline, poster image and trailer
the_lord_of_the_rings_I = media.Movie(
    "The Lord of the Rings: The Fellowship of the Ring",
    "2001",
    " A meek Hobbit from the Shire and eight companions set out on a journey"
    "to destroy the powerful One Ring and save Middle Earth from the"
    "Dark Lord Sauron.",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SY999_CR0,0,673,999_AL_.jpg",    # NOQA
    "https://youtu.be/z_WZxJpHzEE"
    )

# The Lord of the Rings II: title, year, sotryline, poster image and trailer
the_lord_of_the_rings_II = media.Movie(
    "The Lord of the Rings: The Two Towers",
    "2002",
    " While Frodo and Sam edge closer to Mordor with the help of the shifty"
    "Gollum, the divided fellowship makes a stand against Sauron's new ally,"
    "Saruman, and his hordes of Isengard.",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BMDY0NmI4ZjctN2VhZS00YzExLTkyZGItMTJhOTU5NTg4MDU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",   # NOQA
    "https://youtu.be/cvCktPUwkW0"
    )

# The Lord of the Rings III: title, year, sotryline, poster image and trailer
the_lord_of_the_rings_III = media.Movie(
    "The Lord of the Rings: The Return of the King",
    "2003",
    "Gandalf and Aragorn lead the World of Men against Sauron's army to draw"
    "his gaze from Frodo and Sam as they approach Mount Doom with the"
    "One Ring.",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BYWY1ZWQ5YjMtMDE0MS00NWIzLWE1M2YtODYzYTk2OTNlYWZmXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_SY1000_SX668_AL_.jpg",   # NOQA
    "https://youtu.be/yKjizAa8IHE"
    )

# Fight Club: title, year, sotryline, poster image and trailer
fight_club = media.Movie(
    "Fight Club",
    "1999",
    "An insomniac office worker, looking for a way to change his life, crosses"
    "paths with a devil-may-care soap maker, forming an underground fight club"
    "that evolves into something much, much more. ",
    "https://images-na.ssl-images-amazon.com/images/M/MV5BZGY5Y2RjMmItNDg5Yy00NjUwLThjMTEtNDc2OGUzNTBiYmM1XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",   # NOQA
    "https://youtu.be/BdJKm16Co6M"
    )


# Set the movies that will be passed to the media file
movies = [
    the_matrix,
    the_dark_knight,
    schindler_list,
    pulp_fiction,
    the_lord_of_the_rings_I,
    the_lord_of_the_rings_II,
    the_lord_of_the_rings_III,
    fight_club
    ]

# Open the HTML file in a webbrowser via movies_website.py file
movies_website.open_movies_page(movies)
