// global value that holds info about the current hand.
let currentGame = null;

// Initialise global elements so that they can be accessed in different functions
let email = '';
let password = '';
const loginButton = document.createElement('button');
loginButton.classList.add('login-button');
const signUpButton = document.createElement('button');
const message = document.createElement('div');
const createGameBtn = document.createElement('button');

// Make request to database from browser for: Sign up
const signUpDb = () => {
  const data = {
    email: email.value,
    password: password.value,
  };
  axios.post('/signup', data).then((response) => {
    console.log('Signup successful', response);
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

// Make request to database from browser for: Login
const loginDb = () => {
  const data = {
    email: email.value,
    password: password.value,
  };
  axios.post('/login', data).then((response) => {
    console.log('Login successful', response);
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

// Show login / signup functionality when first on page
const getPlayerToLogin = () => {
  email = document.createElement('input');
  email.placeholder = 'Email';
  password = document.createElement('input');
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

// DOM manipulation function that displays the player's current hand.
const runGame = function ({ playerHand }) {
  // manipulate DOM
  const gameContainer = document.querySelector('#game-container');

  gameContainer.innerText = `
    Your Hand:
    ====
    ${playerHand[0].name}
    of
    ${playerHand[0].suit}
    ====
    ${playerHand[1].name}
    of
    ${playerHand[1].suit}
  `;
};

// make a request to the server
// to change the deck.
// set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = function () {
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;

      console.log(currentGame);

      // for this current game, create a button that will allow the user to
      // manipulate the deck that is on the DB.
      // Create a button for it.
      const dealBtn = document.createElement('button');
      dealBtn.addEventListener('click', dealCards);

      // display the button
      dealBtn.innerText = 'Deal';
      document.body.appendChild(dealBtn);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// manipulate DOM, set up create game button
createGameBtn.addEventListener('click', createGame);

// First thing that loads
getPlayerToLogin();
