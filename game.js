const crypto = require('crypto');
const axios = require('axios');

/**
 * Game object class
 */
class GameClass {
  gameID;
  players = [];
  questions = [];
  hostID;
  category;
  difficulty;
  lobbyName;

  /**
     * Constructor to create a game object and set default values.
     * @param {string} hostID
     * @param {number} numQuestions
     * @param {string} category
     * @param {string} difficulty
     */
  constructor(hostID, numQuestions, category, difficulty) {
    this.gameID = crypto.randomUUID();
    this.hostID = hostID;
    this.numQuestions = numQuestions;
    this.category = category;
    this.difficulty = difficulty;
  }

  // eslint-disable-next-line require-jsdoc
  async setup() {
    const url = `https://opentdb.com/api.php?amount=${this.numQuestions}&category=${this.category}&difficulty=${this.difficulty}`;
    await axios.get(url)
        .then((response) => {
          this.questions = response.data.results;
        });
    console.log('Set up the game.');
  }
}

module.exports = GameClass;
