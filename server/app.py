from flask import Flask, g
from flask_restx import Resource, Api, Namespace
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker
from .langman_orm import Usage, User, Game
from sqlalchemy import create_engine
from sqlalchemy.sql import func
from .util import get_config
import datetime
# import random
import uuid
from unidecode import unidecode

games_api = Namespace('games', description='Creating and playing games')


@games_api.route('')
class Games(Resource):
    valid_langs = ('en', 'es', 'fr')

    def post(self):
        '''Start a new game and return the game id

        :route: ``/`` GET (valid token required)

        :payload:
              * ``language`` Language to play in (e.g., 'en')

        :returns:
           A success message:
              * ``message`` Literal 'success'
              * ``game_id`` The new game's UUID
        '''
        # * Check input is valid
        if not (games_api.payload and 'username' in games_api.payload and
                'language' in games_api.payload):
            games_api.abort(400,
                            'New game POST requires username and language')
        lang = games_api.payload['language']
        name = games_api.payload['username']
        user_id = str(uuid.uuid3(uuid.NAMESPACE_URL, name))
        if lang not in self.valid_langs:
            return {'message': f'New game POST language must be from \
                {", ".join(Games.valid_langs)}'}, 400

        # * If user does not exist, create user: get user id
        user = g.games_db.query(User).filter(User.user_id ==
                                             user_id).one_or_none()
        if user is None:
            user = User(
                user_id=user_id,
                user_name=name,
                first_time=datetime.datetime.now()
            )
            g.games_db.add(user)
            g.games_db.commit()
            user = g.games_db.query(User).filter(User.user_name == name).one()
        user._game_started(lang)

        # * Select a usage example
        usage = g.usage_db.query(Usage).filter(
            Usage.language == lang).order_by(func.random()).first()

        # * Create the new game
        new_game_id = str(uuid.uuid4())
        new_game = Game(
            game_id=new_game_id,
            player=user.user_id,
            usage_id=usage.usage_id,
            bad_guesses=0,
            reveal_word='_'*len(usage.secret_word),
            start_time=datetime.datetime.now()
        )
        g.games_db.add(new_game)
        g.games_db.commit()
        return {'message': f"success, game_id:{new_game_id}"}


@games_api.route('/<game_id>')
class OneGame(Resource):
    def get(self, game_id):
        '''Get the game ``game_id`` information

        :route: ``/<game_id>`` GET (valid token required)

        :returns:
           The object for a game, including:
              * ``game_id`` The game's UUID
              * ``player`` The player's name
              * ``usage_id`` The game usage id from the Usages table
              * ``guessed`` A string of guessed letters
              * ``reveal_word`` Guessed letters in otherwise
                blanked word string
              * ``bad_guesses`` Number of incorrect guesses so far
              * ``start_time`` The epoch ordinal time when game began
              * ``end_time`` The epoch ordinal time when game ended
              * ``result`` Game outcome from ('lost', 'won', 'active')
              * ``usage`` The full sentence example with guess-word blanked
              * ``lang`` The language of the example, such as 'en'
              * ``source`` The book from which the usage example originated
        '''
        # * check input is valid
        game = g.games_db.query(Game).filter(Game.game_id ==
                                             game_id).one_or_none()

        # * if game does not exist or belongs to another user,
        # * produce error code
        if game is None:
            games_api.abort(404, f'Game with id: {game_id} does not exist')

        # * get usage record because it contains the language and usage example
        usage = g.usage_db.query(Usage).filter(
            Usage.usage_id == game.usage_id).one()
        # * Return game state

        game_dict = game._to_dict()
        usage1 = usage.usage.format(word='_'*len(usage.secret_word))
        game_dict['usage'] = usage1
        game_dict['lang'] = usage.language
        game_dict['source'] = usage.source

        return game_dict

    def put(self, game_id):
        '''Update game ``game_id`` as resulting from a guessed letter

        :route: ``/<game_id>`` PUT (valid game-specific token required)

        :payload:
           The guessed letter as an object:
              * ``letter`` A single guessed letter

        :returns:
           The object for a game, including:
              * ``game_id`` The game's UUID
              * ``player`` The player's name
              * ``usage_id`` The game usage id from the Usages table
              * ``guessed`` A string of guessed letters
              * ``reveal_word`` Guessed letters in otherwise blanked
                word string
              * ``bad_guesses`` Number of incorrect guesses so far
              * ``start_time`` The epoch ordinal time when game began
              * ``end_time`` The epoch ordinal time when game ended
              * ``result`` Game outcome from ('lost', 'won', 'active')

        This method interacts with the database to update the
        indicated game.
        '''
        # * Check input is valid; return error if game non-existent or inactive
        game = g.games_db.query(Game).filter(Game.game_id ==
                                             game_id).one_or_none()
        if game is None:
            games_api.abort(404, f"Game with id {game_id} does not exist")
        if game._result() != 'active':
            games_api.abort(403, f"Game with id {game_id} is over")
        if ('letter' not in games_api.payload or
           not games_api.payload['letter'].isalpha() or
           len(games_api.payload['letter']) != 1):
            games_api.abort(400, 'PUT requires one alphabetic character in\
                "letter" field')
        letter = games_api.payload['letter'].lower()

        # * Update game state according to guess
        if letter in game.guessed:             # check for repeated guess
            games_api.abort(403, f'Letter {letter} was already guessed')
        game.guessed = game.guessed + letter
        usage = g.usage_db.query(Usage).filter(
            Usage.usage_id == game.usage_id).one()
        if letter in unidecode(usage.secret_word.lower()):
            game.reveal_word = ''.join([
                char if unidecode(char.lower()) in game.guessed else '_'
                for char in usage.secret_word])
        else:
            game.bad_guesses += 1

        # * if game is over, update the user record
        outcome = game._result()
        if outcome != 'active':
            user = g.games_db.query(User).filter(
                User.user_id == game.player).one()
            game.end_time = datetime.datetime.now()
            user._game_ended(outcome, game.end_time - game.start_time)

        # * return the modified game state
        game_dict = game._to_dict()
        game_dict['usage'] = usage.usage.format(
            word='_'*len(usage.secret_word))
        game_dict['lang'] = usage.language
        game_dict['source'] = usage.source
        if outcome != 'active':
            game_dict['secret_word'] = usage.secret_word

        g.games_db.commit()

        return game_dict

    def delete(self, game_id):
        '''Delete record for game ``game_id``

        :route: ``/<game_id>`` DELETE (valid game-specific token required)
        :returns:
           An acknowledgment object:
              * ``message`` Either 'One' or 'Zero' records deleted

        This method removed the game from its table
        '''
        game = g.games_db.query(Game).filter(
            Game.game_id == game_id).one_or_none()
        if game is not None:
            g.games_db.delete(game)
            g.games_db.commit()
            msg = 'One record deleted'
        else:
            msg = 'Zero records deleted'

        return {'message': msg}


app = Flask(__name__)  # * Creating Flask App
app.config.update(get_config(app.config['ENV'],
                             app.open_resource('config.yaml')))
CORS(app)  # * Cross-origin resource sharing
api = Api(app)  # * Create RESTplus api on app
api.add_namespace(games_api, path='/api/games')  # * Insert games namespace


@app.before_request
def init_db():
    '''Initialize db by creating the global db_session

    This runs on each request.
    '''
    if not hasattr(g, 'usage_db'):
        db_usage = create_engine(app.config['DB_USAGE'])
        g.usage_db = sessionmaker(db_usage)()
    if not hasattr(g, 'games_db'):
        db_games = create_engine(app.config['DB_GAMES'])
        g.games_db = sessionmaker(db_games)()


@app.teardown_request
def close_db(exception):
    '''Close down db connection; same one cannot be used b/w threads

    This runs after each request.
    '''
    if hasattr(g, 'usage_db'):
        g.usage_db.close()
        _ = g.pop('usage_db')
    if hasattr(g, 'games_db'):
        g.games_db.close()
        _ = g.pop('games_db')
