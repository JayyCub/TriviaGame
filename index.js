const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const GameClass = require('./game');

const port = 8080;

const games = new Map();

let hostUUID = '';

const requestHandler = async (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    console.log('Main webpage request');
    // Serve the HTML page
    const filePath = path.join(__dirname, 'index.html');
    const stream = fs.createReadStream(filePath);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    stream.pipe(res);
  } else if (req.url === '/host/init' && req.method === 'GET') {
    console.log('Initiating game');
    const givenUUID = req.headers.uuid;
    const numQuestions = req.headers.num;
    const category = req.headers.category;
    const difficulty = req.headers.difficulty;
    const lobbyName = req.headers.name;
    console.log(lobbyName)
    const newGame =
        new GameClass(givenUUID, numQuestions, category, difficulty, lobbyName);
    await newGame.setup();
    console.log("Adding game...");
    games.set(newGame.gameID, newGame);
    console.log(games.size);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({success: true}));
    console.log('Created Game.');
  } else if (req.url === '/host/setup' && req.method === 'GET') {
    console.log('Setup webpage request');
    // Serve the HTML page
    const filePath = path.join(__dirname, 'host-setup.html');
    const stream = fs.createReadStream(filePath);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    stream.pipe(res);
  } else if (req.url === '/host/lobby' && req.method === 'GET') {
    console.log('Lobby webpage request');
    const filePath = path.join(__dirname, 'host-lobby.html');
    const stream = fs.createReadStream(filePath);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    stream.pipe(res);
  } else if (req.url === '/player/lobbies' && req.method === 'GET') {
    console.log('Player Lobby select webpage request');
    // Serve the HTML page
    const filePath = path.join(__dirname, 'player-select-lobby.html');
    const stream = fs.createReadStream(filePath);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    stream.pipe(res);

  } else if (req.url === '/player/find-lobbies' && req.method === 'GET') {
    let lobbies = {};
    console.log("Checking lobbies...")
    // console.log("Number of lobbies: " + games.size)
    for (const [key, value] of games.entries()) {
      // console.log(value);
      lobbies[key] = {
        name: value.lobbyName,
        gameID: value.gameID,
        numPlayers: value.players.length,
      };
    }
    // console.log(lobbies);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:8080',
    });
    res.end(JSON.stringify({success: true, lobbies: lobbies}));

  } else if (req.url === '/host/end' && req.method === 'POST') {
    console.log('Closing game host');
    const givenUUID = req.headers.uuid;
    if (hostUUID === givenUUID) {
      hostUUID = '';
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:8080',
      });
      res.end(JSON.stringify({success: true}));
      console.log('Removed host');
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:8080',
      });
      res.end(JSON.stringify({success: false}));
      console.log('User is not host. Not closed.');
    }
  } else if (req.url === '/uuid' && req.method === 'GET') {
    console.log('Getting new UUID...');
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:8080',
    });
    const uuid = crypto.randomUUID();
    res.end(JSON.stringify({uuid: uuid}));
  } else {
    // Handle other requests (if any)
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
};


const server = http.createServer(requestHandler);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
