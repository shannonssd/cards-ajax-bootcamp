/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Global Variables
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// global value that holds info about the current game.
let currentGame = null;

let email = '';
let password = '';
const loginButton = document.createElement('button');
loginButton.classList.add('login-button');
const signUpButton = document.createElement('button');
const message = document.createElement('div');
const createGameBtn = document.createElement('button');
const player1Display = document.createElement('div');
player1Display.classList.add('display');
const player2Display = document.createElement('div');
player2Display.classList.add('display');
let nextPlayerTurn = 0;

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *    Make request to database from browser for: Sign up
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

const signUpDb = () => {
  const data = {
    email: email.value,
    password: password.value,
  };
  axios.post('/signup', data).then((response) => {
    if (response.data === 'Success!') {
      email.value = '';
      password.value = '';
      message.innerText = 'Sign up successful, please login!';
      document.body.appendChild(message);
    } else {
      email.value = '';
      password.value = '';
      message.innerText = 'Username exists, please try a different username';
      document.body.appendChild(message);
    }
  }).catch((error) => {
    // handle error
    console.log('Error:', error);
  });
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *    Make request to database from browser for: Login
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

const loginDb = () => {
  const data = {
    email: email.value,
    password: password.value,
  };
  axios.post('/login', data).then((response) => {
    if (response.data === 'Invalid login') {
      email.value = '';
      password.value = '';
      message.innerText = 'Invalid login!';
      document.body.appendChild(message);
    } else {
      document.body.removeChild(email);
      document.body.removeChild(password);
      document.body.removeChild(message);
      document.body.removeChild(loginButton);
      document.body.removeChild(signUpButton);
      // create game btn
      createGameBtn.innerText = 'Create Game';
      document.body.appendChild(createGameBtn);
    }
  }).catch((error) => {
    // handle error
    console.log('Error:', error);
  });
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *   Show login / signup functionality when page first loads
 *
 * ========================================================
 * ========================================================
 */

const getPlayerToLogin = () => {
  email = document.createElement('input');
  email.placeholder = 'Email';
  password = document.createElement('input');
  password.setAttribute('type', 'password');
  password.placeholder = 'Password';
  loginButton.innerText = 'login';
  signUpButton.innerText = 'signup';
  loginButton.addEventListener('click', loginDb);
  signUpButton.addEventListener('click', signUpDb);
  document.body.appendChild(email);
  document.body.appendChild(password);
  document.body.appendChild(signUpButton);
  document.body.appendChild(loginButton);
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *         Display current hand
 *
 * ========================================================
 * ========================================================
 */

const runGame = function (playerHand, name) {
  // manipulate DOM
  const p1GameContainer = document.querySelector('.player1-cards');
  const p2GameContainer = document.querySelector('.player2-cards');
  if (nextPlayerTurn === 2) {
    p1GameContainer.innerText = `
    Player 1: \n ${name}'s Hand:
    ====
    ${playerHand[0].name} of ${playerHand[0].suit}
    ====
    ${playerHand[1].name} of ${playerHand[1].suit}
  `;
    player1Display.innerHTML = `Player 1: ${currentGame.player1Name} please wait!`;
    player2Display.innerHTML = `Player 2: ${currentGame.player2Name} please draw a card!`;
  } else {
    p2GameContainer.innerText = `
     Player 2: \n ${name}'s Hand:
    ====
    ${playerHand[0].name} of ${playerHand[0].suit}
    ====
    ${playerHand[1].name} of ${playerHand[1].suit}
  `;
    player1Display.innerHTML = `Player 1: ${currentGame.player1Name} please draw a card!`;
    player2Display.innerHTML = `Player 2: ${currentGame.player2Name} please wait!`;
  }
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                    Evaluate Winner
 *
 * ========================================================
 * ========================================================
 */

const evaluateResults = function () {
  axios.get(`/result/${currentGame.id}`).then((response) => {
    // get the updated hand value
    currentGame = response.data;
    player1Display.innerHTML = `${currentGame.winner}`;
    player2Display.innerHTML = '';
  });
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *             Server request:  Deal cards
 *
 * ========================================================
 * ========================================================
 */

const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;
      nextPlayerTurn = currentGame.nextPlayerTurn;

      if (nextPlayerTurn === 2) {
        // display cards to user
        runGame(currentGame.player1Hand, currentGame.player1Name);
      } else {
        // display cards to user
        runGame(currentGame.player2Hand, currentGame.player2Name);
      }
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *            Server request: Create new game
 *
 * ========================================================
 * ========================================================
 */

const createGame = function () {
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      document.body.removeChild(createGameBtn);

      // set the global value to the new game.
      currentGame = response.data;

      // Create button to deal cards
      const dealBtn = document.createElement('button');
      const buttonDiv = document.createElement('div');
      buttonDiv.classList.add('display');
      dealBtn.addEventListener('click', dealCards);
      // display the button
      dealBtn.innerText = 'Deal';
      buttonDiv.appendChild(dealBtn);
      document.body.appendChild(buttonDiv);

      // results button
      const resultsBtn = document.createElement('button');
      resultsBtn.innerText = 'Current Winner';
      buttonDiv.appendChild(resultsBtn);
      resultsBtn.addEventListener('click', evaluateResults);

      // Show player names + instructions
      player1Display.innerHTML = `Player 1: ${currentGame.player1Name} please draw a card!`;
      player2Display.innerHTML = `Player 2: ${currentGame.player2Name} please wait!`;
      document.body.appendChild(player1Display);
      document.body.appendChild(player2Display);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// Button to create game
createGameBtn.addEventListener('click', createGame);

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *          Generate login / signup input bars
 *
 * ========================================================
 * ========================================================
 */

getPlayerToLogin();
