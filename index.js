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
    const newGame =
        new GameClass(givenUUID, numQuestions, category, difficulty);
    await newGame.setup();
    games.set(newGame.gameID, newGame);
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
  } else if (req.url === '/host/end' && req.method === 'POST') {
    console.log('Closing game host');
    const givenUUID = req.headers.uuid;
    // console.log(hostUUID);
    // console.log(givenUUID);
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
