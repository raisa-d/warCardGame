// global variables
let deckID = ''; // global variable for deckID
let p1WarCard, p2WarCard;
// variables to store pictures for player1 and 2
let p1Pic = document.querySelector('#player1')
let p2Pic = document.querySelector('#player2')

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

// initialize local storage for both players' piles
if (!localStorage.getItem('p1Pile')) {
  localStorage.setItem('p1Pile', 0)
}
if (!localStorage.getItem('p2Pile')) {
  localStorage.setItem('p2Pile', 0)
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
  const ogDeck = `https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=${numCards}`

  fetch(ogDeck)
    .then(res => res.json())
    .then(data => {
      console.log(data)

      // if there aren't enough cards to draw from
      if (data.error === `Not enough cards remaining to draw ${numCards} additional`) {
        // **draw from your own piles
        drawFromPlayerDecks('player1', numCards)
        drawFromPlayerDecks('player2', numCards)
      }
      
      // place images of cards picked into DOM
      p1Pic.src = data.cards[numCards - 2].image
      p2Pic.src = data.cards[numCards - 1].image

      document.querySelector('p').innerText = ''
    
      // get value from each card, pass into convertToNum function so all of our data can be handled as numbers
      let player1Val = convertToNum(data.cards[numCards - 2].value)
      let player2Val = convertToNum(data.cards[numCards - 1].value)

      // variable for where we place result
      let result = document.querySelector('h3')

      // if player 1 wins
      if (player1Val > player2Val) {
        if (isWar) {
          result.innerText = 'Player 1 Wins the War!' 
          buttonReg.classList.remove('hidden')
          warButton.classList.add('hidden')
    
        } else {
          result.innerText = 'Player 1 Wins!';

        }
        
        // if it isn't war and player 1 wins, they add 2 cards to their pile
        if (!isWar) {
          let p1CardCode = data.cards[0].code
          let p2CardCode = data.cards[1].code
          addTwoToPile('player1', p1CardCode, p2CardCode)
        } else { // if it is war, they add 8 cards to their pile
          let cardCodes = [p1WarCard, p2WarCard]
          // fill array of card codes
          for (let i = 0; i < 8; i++) {
            cardCodes.push(data.cards[i].code)
          }
          // pass them in as arguments to addTenToPile
          addTenToPile('player1', ...cardCodes)
        }

      // if player 2 wins
      } else if (player1Val < player2Val) {
        if (isWar) {
          result.innerText = 'Player 2 Wins the War!' 
          buttonReg.classList.remove('hidden')
          warButton.classList.add('hidden')
        } else result.innerText = 'Player 2 Wins!';
        
        // if player 2 wins, they add all of the cards to their pile
        if (!isWar) {
          let p1CardCode = data.cards[0].code
          let p2CardCode = data.cards[1].code
          addTwoToPile('player2', p1CardCode, p2CardCode)
        } else {
          // beginning with the cards that were intiially picked in array, then add the rest
          let cardCodes = [p1WarCard, p2WarCard]
          for (let i = 0; i < 8; i++) {
            cardCodes.push(data.cards[i].code)
          }
          addTenToPile('player2', ...cardCodes)
        }
      
      // if it is war
      } else {
        // set pWarCards equal to the cards that prompted the war. stored in global variable so can add them to pile later
        p1WarCard = data.cards[0].code
        p2WarCard = data.cards[1].code
        result.innerText = 'TIME FOR WAR'
        console.log('WAR ROUND')
        wartime()
      }

    })
    .catch(err => {
      console.log(`error ${err}`)
    });
}

// helper function to convert royal cards to numbers (or for other cards, just return the string value to a number)
let convertToNum = val => val === 'ACE' ? 14 : val === 'KING' ? 13 : val === 'QUEEN' ? 12 : val === 'JACK' ? 11 : Number(val)

function checkPileCounts(data) {
  // if they have the property remaining, set item to that property
  if (data.piles['player1'].remaining) {
    localStorage.setItem('p1Pile', data.piles['player1'].remaining)
    
    let p1PileCount = localStorage.getItem('p1Pile')
    document.querySelector('#p1PileCount').innerText = `${p1PileCount} Cards in Pile`
  }
  if (data.piles['player2'].remaining) {
    localStorage.setItem('p2Pile', data.piles['player2'].remaining)

    let p2PileCount = localStorage.getItem('p2Pile')
    document.querySelector('#p2PileCount').innerText = `${p2PileCount} Cards in Pile`
  }
}

// function to add the cards each player has won into their own piles (normal rounds)
function addTwoToPile(player, card1, card2) {
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/pile/${player}/add/?cards=${card1},${card2}`)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data);
    checkPileCounts(data)
  })
  .catch(err => {
    console.log(`error ${err}`)
  });
}

function addTenToPile(player, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10) {
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/pile/${player}/add/?cards=${c1},${c2},${c3},${c4},${c5},${c6},${c7},${c8},${c9},${c10}`)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data);
    checkPileCounts(data)
  })
  .catch(err => {
    console.log(`error ${err}`)
  });
}

function wartime() {
  // hide button for regular round
  buttonReg.classList.add('hidden')
  // show button for war round
  warButton.classList.remove('hidden')
  
  // event listener on war button 
  warButton.addEventListener('click', () => drawCards(8, true))
}

// **function for when players start drawing from their own decks individually. 
// pass in which player is drawing from their deck? or don't pass in anything because regardless we will draw one from each deck. if someone has no cards left in their deck, they lose ando ther person wins
function drawFromPlayerDecks(player, numCards) {
  // URL to draw 1 card from player 1's deck
  let p1DeckURL = `https://www.deckofcardsapi.com/api/deck/${deckID}/pile/player1/draw/?count=${numCards}`
  
  // URL to draw 1 card from player 2's deck
  let p2DeckURL = `https://www.deckofcardsapi.com/api/deck/${deckID}/pile/player2/draw/?count=${numCards}`

  // dictate which url to fetch based on which player was passed in
  let url; 
  player === 'player1' ? url = p1DeckURL : url = p2DeckURL;

  // message about not enough cards to draw (temporary)
  document.querySelector('p').innerText = 'Not enough cards to draw from...in next iteration you will be able to draw from your own piles'

  // API Fetch to draw from decks
  fetch(url)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data);
    // **need to insert pics into DOM, do the same comparisons made in regular draw from deck so we can compare who won
    // need to add winners cards back into the piles they were drawn from (different api link i think)
  })
  .catch(err => {
    console.log(`error ${err}`)
  });
}

/*
=== CHANGES TO MAKE ===
Where I left off:
  - I was working on the drawFromPlayerDecks() function. Within that funciton, I need to: insert pics into DOM, do the same comparisons made in drawCards() so we can compare who won, add winners cards back into the piles they were drawn from (different api link i think)

General
  - **handle the case where you have no cards left but try to draw. instead you need to draw from your own deck (drawFromPlayerDecks())
  - when they begin drawing from their own piles, update the card count (using the remaining property). get from local storage
  - announce who won the game and give option to play again
  - make code more modular and DRY

At beginning of game:
  - have it enter on a start game screen
  - if there was a previous game, ask user if they want to continue that game or start a new one. if they want to start a new one, we need to get a new deckID
  - let them choose how many players and player names

Styling
   - have war rounds styling be different/more intense than regular rounds
   - have a visual representation of a player pile with the count of how many they have in their pile
   - make a physcial representation of the 3 cards they are pulling before the 4th in the war round

Bugs to fix:
  - 
*/