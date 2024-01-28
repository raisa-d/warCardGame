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

// event listener for button click to draw cards
document.querySelector('button').addEventListener('click', () => {drawCards(2)});

// when click button, draw 2 cards
function drawCards(numCards){
  const url = `https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=${numCards}`

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      
      // insert images of last two cards picked into dom
      document.querySelector('#player1').src = data.cards[numCards - 2].image
      document.querySelector('#player2').src = data.cards[numCards - 1].image

      // get value from each card, pass into convertToNum function so all of our data can be handled as numbers
      let player1Val = convertToNum(data.cards[numCards - 2].value)
      let player2Val = convertToNum(data.cards[numCards - 1].value)

      // variable for where we place result
      let result = document.querySelector('h3')

      // logic to handle who wins
      if (player1Val > player2Val) {
        result.innerText = 'Player 1 Wins!'
        
        // if player 1 wins, they add all of the cards to their pile
        for(let i = 0; i < numCards; i++) {
          addToPile('player1', data.cards[i].code)
        }

      } else if (player1Val < player2Val) {
        result.innerText = 'Player 2 Wins!'
        
        // if player 2 wins, they add all of the cards to their pile
        for(let i = 0; i < 8; i++) {
          addToPile('player2', data.cards[i].code)
        }
      
      } else {
        result.innerText = 'TIME FOR WAR'
        setTimeout(wartime, "2 seconds")
      }



    })
    .catch(err => {
      console.log(`error ${err}`)
    });
}

// function drawTwo(numCards){
//   const url = `https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=${numCards}`

//   fetch(url)
//     .then(res => res.json())
//     .then(data => {
//       console.log(data)
      
//       // insert player imgs into dom
//       document.querySelector('#player1').src = data.cards[0].image
//       document.querySelector('#player2').src = data.cards[1].image

//       // get value from each card, pass into convertToNum function so all of our data can be handled as numbers
//       let player1Val = convertToNum(data.cards[0].value)
//       let player2Val = convertToNum(data.cards[1].value)
//       let p1CardCode = data.cards[0].code
//       let p2CardCode = data.cards[1].code

//       // variable for where we place result
//       let result = document.querySelector('h3')

//       // logic to handle who wins
//       if (player1Val > player2Val) {
//         result.innerText = 'Player 1 Wins!'
        
//         // add cards to player 1's pile
//         addToPile('player1', p1CardCode)
//         addToPile('player1', p2CardCode)

//       } else if (player1Val < player2Val) {
//         result.innerText = 'Player 2 Wins!'
        
//         // add cards to player 2's pile
//         addToPile('player2', p1CardCode)
//         addToPile('player2', p2CardCode)
      
//       } else {
//         result.innerText = 'WARTIME'
//         wartime()
//       }



//     })
//     .catch(err => {
//       console.log(`error ${err}`)
//     });
// }

// helper function to convert royal cards to numbers (or for other cards, just return the string value to a number)
let convertToNum = val => val === 'ACE' ? 14 : val === 'KING' ? 13 : val === 'QUEEN' ? 12 : val === 'JACK' ? 11 : Number(val)

// function to add the cards each player has won into their own piles
// ** make this function so you can add more than two to the pile (in case of war and you need to add 4 cards. maybe have a player argument and a card array argument? you can have an array of the codes that need to be added to their piles, and loop through the array)
function addToPile(player, card) {
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/pile/${player}/add/?cards=${card}`)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(`error ${err}`)
  });
}

// **WAR. each person draws 3 cards flipped over and the 4th compete against each other
function wartime() {
  drawCards(8)
// **add cards to winner's pile (right now the cards are added to their piles in the drawTwo() function, but it only adds the first two cards (because of the addTwoCards() function)) need to make it so you can add any number of cards
}

// **function for when players start drawing from their own decks individually
function drawFromPlayerDeck(player) {

}

/*
CHANGES TO MAKE
- handle the case where you have no cards left but try to draw. instead you need to draw from your own deck
- code what happens when you actually have war, drawing 3 cards each then the 4th
- announce who won the game
- style game

At beginning of game:
- have it enter on a start game screen
- if there was a previous game, ask user if they want to continue that game or start a new one. if they want to start a new one, we need to get a new deckID
- let them choose how many players and player names
*/