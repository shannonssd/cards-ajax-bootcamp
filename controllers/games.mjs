import getHash from '../hashing.mjs';

let player1Name = '';
let player2Name = '';
let player1Id = 0;
let player2Id = 0;
let isP2loggedIn = false;
let playerTurn = 1;
let isFirstTurn = true;
/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};
// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function initGamesController(db) {
  const { Op } = db.Sequelize;
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  const signUp = async (request, response) => {
    const { email } = request.body;
    const { password } = request.body;
    const hashedPassword = getHash(password);

    const checkIfUserExists = await db.User.findOne({
      where: {
        email,
        password: hashedPassword,
      },
    });

    console.log('checkIfUserExists:', checkIfUserExists);

    if (checkIfUserExists === null) {
      const newUser = await db.User.create({
        email,
        password: hashedPassword,
      });
      response.send('Success!');
    } else {
      response.send('User exists');
    }
  };

  const login = async (request, response) => {
    player1Name = request.body.email;
    const { password } = request.body;
    const hashedPassword = getHash(password);
    console.log(request);
    const checkUser = await db.User.findOne({
      where: {
        email: player1Name,
        password: hashedPassword,
      },
    });
    console.log('checkUser:', checkUser);
    if (checkUser === null) {
      response.send('Invalid login');
    } else {
      player1Id = checkUser.id;
      response.cookie('loggedInHash', hashedPassword);
      response.cookie('userId', player1Name);
      response.send('Logged in!');
    }
  };

  // 1. Create new game is game table
  // 2. Add second player // If no other player in DB used non-logged in player
  // 3. Add users to join table

  const create = async (request, response) => {
    // Find list of all other users
    const otherUsers = await db.User.findAll({
      where: {
        email: {
          [Op.ne]: player1Name,
        },
      },
    });
    // Assign player 2
    if (otherUsers === null) {
      player2Name = 'NON-LOGGED IN P2';
    } else {
      isP2loggedIn = true;
      const player2 = otherUsers[getRandomIndex(otherUsers.length)];
      player2Id = player2.id;
      player2Name = player2.email;
    }
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());

    const newGame = {
      gameState: {
        cardDeck,
        player1Name,
        player2Name,
      },
    };

    try {
      // Create new game in DB
      const game = await db.Game.create(newGame);
      // Create new entry in join table
      await db.UserGame.create({
        gameId: game.id,
        userId: player1Id,
      });
      // If P2 logged in, create new entry in join table
      if (isP2loggedIn === true) {
        await db.UserGame.create({
          gameId: game.id,
          userId: player2Id,
        });
      }
      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        player1Name,
        player2Name,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // 1. Deal cards to player
  // 2. Switch player
  // 3. Evaluate winner after p2 gets cards
  // 4. Change back to player 1
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);
      if (playerTurn === 1) {
        playerTurn = 2;
        const player1Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
        // update the game with the new info
        if (isFirstTurn === true) {
          await game.update({
            gameState: {
              cardDeck: game.gameState.cardDeck,
              player1Hand,
              player1Name: game.gameState.player1Name,
              player2Name: game.gameState.player2Name,
            },
          });
        } else {
          await game.update({
            gameState: {
              cardDeck: game.gameState.cardDeck,
              player1Hand,
              player2Hand: game.gameState.player2Hand,
              player1Name: game.gameState.player1Name,
              player2Name: game.gameState.player2Name,
            },
          });
        }
      } else {
        playerTurn = 1;
        const player2Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
        // update the game with the new info
        await game.update({
          gameState: {
            cardDeck: game.gameState.cardDeck,
            player1Hand: game.gameState.player1Hand,
            player2Hand,
            player1Name: game.gameState.player1Name,
            player2Name: game.gameState.player2Name,
          },
        });
      }

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      if (isFirstTurn === true) {
        isFirstTurn = false;
        response.send({
          id: game.id,
          player1Hand: game.gameState.player1Hand,
          nextPlayerTurn: playerTurn,
          player1Name: game.gameState.player1Name,
          player2Name: game.gameState.player2Name,
        });
      } else {
        response.send({
          id: game.id,
          player1Hand: game.gameState.player1Hand,
          player2Hand: game.gameState.player2Hand,
          nextPlayerTurn: playerTurn,
          player1Name: game.gameState.player1Name,
          player2Name: game.gameState.player2Name,
        });
      }
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
    signUp,
    login,
  };
}
