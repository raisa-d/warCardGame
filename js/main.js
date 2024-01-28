let deckID = ''; // global variable for deckID

// only if there is not already a deck id stored, then get a new deck
if (!localStorage.getItem('deck_id')) {
  // we get a deck of cards. we store the id for that deck in a global variable deckID (if we don't already have a deckID in local storage)
  fetch('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data);

    // if there is not already a deckID stored, set it
    localStorage.setItem('deck_id', data.deck_id)
  })
  .catch(err => {
    console.log(`error ${err}`)
  });
}

// set deckID variable to the same ID stored in local storage
deckID += localStorage.getItem('deck_id')

// variables for buttons
const buttonReg = document.querySelector('#buttonReg')
const warButton = document.querySelector('#buttonWar')

// event listener for button click to draw cards
buttonReg.addEventListener('click', () => {drawCards(2, false)});

// when click button, draw 2 cards
function drawCards(numCards, isWar){
  const url = `https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=${numCards}`

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data)

      // if there aren't enough cards to draw from
      if (data.error === `Not enough cards remaining to draw ${numCards} additional`) {
        // **draw from your own piles
        drawFromPlayerDecks()
      }

      // variables to store pictures for player1 and 2
      let p1Pic = document.querySelector('#player1')
      let p2Pic = document.querySelector('#player2')
      
      // place images of cards picked into DOM
      p1Pic.src = data.cards[numCards - 2].image
      p2Pic.src = data.cards[numCards - 1].image

      document.querySelector('p').innerText = ''
    
      // get value from each card, pass into convertToNum function so all of our data can be handled as numbers
      let player1Val = convertToNum(data.cards[numCards - 2].value)
      let player2Val = convertToNum(data.cards[numCards - 1].value)

      // variable for where we place result
      let result = document.querySelector('h3')

      // logic to handle who wins
      if (player1Val > player2Val) {
        if (isWar) {
          result.innerText = 'Player 1 Wins the War!' 
          buttonReg.classList.remove('hidden')
          warButton.classList.add('hidden')
        } else result.innerText = 'Player 1 Wins!';
        // isWar ? result.innerText = 'Player 1 Wins the War!' : result.innerText = 'Player 1 Wins!'
        
        // if it isn't war and player 1 wins, they add 2 cards to their pile
        if (!isWar) {
          let p1CardCode = data.cards[0].code
          let p2CardCode = data.cards[1].code
          addTwoToPile('player1', p1CardCode, p2CardCode)
        } else { // if it is war, they add 8 cards to their pile
          let cardCodes = []
          // fill array of card codes
          for (let i = 0; i < 8; i++) {
            cardCodes.push(data.cards[i].code)
          }
          // pass them in as arguments to addEightToPile
          addEightToPile('player1', ...cardCodes)
        }

      } else if (player1Val < player2Val) {
        if (isWar) {
          result.innerText = 'Player 2 Wins the War!' 
          buttonReg.classList.remove('hidden')
          warButton.classList.add('hidden')
        } else result.innerText = 'Player 2 Wins!';
        // isWar ? result.innerText = 'Player 2 Wins the War!' : result.innerText = 'Player 2 Wins!'
        
        // if player 2 wins, they add all of the cards to their pile
        if (!isWar) {
          let p1CardCode = data.cards[0].code
          let p2CardCode = data.cards[1].code
          addTwoToPile('player2', p1CardCode, p2CardCode)
        } else {
          let cardCodes = []
          for (let i = 0; i < 8; i++) {
            cardCodes.push(data.cards[i].code)
          }
          addEightToPile('player2', ...cardCodes)
        }
      
      } else {
        wartime()
      }

    })
    .catch(err => {
      console.log(`error ${err}`)
    });
}

// helper function to convert royal cards to numbers (or for other cards, just return the string value to a number)
let convertToNum = val => val === 'ACE' ? 14 : val === 'KING' ? 13 : val === 'QUEEN' ? 12 : val === 'JACK' ? 11 : Number(val)

// function to add the cards each player has won into their own piles (normal rounds)
function addTwoToPile(player, card1, card2) {
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/pile/${player}/add/?cards=${card1},${card2}`)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(`error ${err}`)
  });
}

function addEightToPile(player, c1, c2, c3, c4, c5, c6, c7, c8) {
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/pile/${player}/add/?cards=${c1},${c2},${c3},${c4},${c5},${c6},${c7},${c8}`)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(`error ${err}`)
  });
}

function wartime() {
  result.innerText = 'TIME FOR WAR'
  console.log('WAR ROUND')

  // hide button for regular round
  buttonReg.classList.add('hidden')
  // show button for war round
  warButton.classList.remove('hidden')
  
  // event listener on war button 
  warButton.addEventListener('click', () => drawCards(8, true))
}

// **function for when players start drawing from their own decks individually
function drawFromPlayerDecks() {
  document.querySelector('p').innerText = 'Not enough cards to draw from...in next iteration you will be able to draw from your own piles'
}

/*
=== CHANGES TO MAKE ===
- handle the case where you have no cards left but try to draw. instead you need to draw from your own deck (drawFromPlayerDecks())
- show users how many cards each player has in their piles (and maybe a picture of it face down), when they begin drawing from their own piles, update that count (using the remaining property).
- store how many cards each player has in local storage
- make a physcial representation of the 3 cards they are pulling before the 4th in the war round
- announce who won the game
- style game
   - have war rounds styling be different/more intense than regular rounds

At beginning of game:
- have it enter on a start game screen
- if there was a previous game, ask user if they want to continue that game or start a new one. if they want to start a new one, we need to get a new deckID
- let them choose how many players and player names
*/