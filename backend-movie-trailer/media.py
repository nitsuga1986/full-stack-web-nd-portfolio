import webbrowser


class Movie():
    def __init__(self, title, year, sotryline, poster_url, trailer_url):
        """Creates a Movie object

        Inputs required are:
            movie title, release year, sotryline,
            poster_url, trailer_url
        """
        self.title = title
        self.year = year
        self.sotryline = sotryline
        self.poster_url = poster_url
        self.trailer_url = trailer_url
