const express = require("express");
const cors = require("cors");

const { v4: uuid } = require('uuid');
const { isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];


/**
 * MODELO DE DADOS
  {
    "title": "Redis",
    "url": "https://github.com/vinieloy/app-redis-repositories",
    "techs": ["Docker", "Javascript", "Redis"]
  }
  {
    "title": "NodeJS",
    "url": "https://github.com/vinieloy/app-node-repositories",
    "techs": ["NodeJS", "Javascript"]
  }
 */

function logRequests(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

function validateRepoId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)) {
      return response.status(400).json({ error: 'Invalid repository ID.' });
  }

  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validateRepoId);


//GET - List
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});


//POST - Create
app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;
  const repo = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repo);

  return response.json(repo);
});


//PUT - Update
app.put('/repositories/:id', (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repoIndex = repositories.findIndex(repo => repo.id == id);

  if(repoIndex < 0 ) {
    return response.status(400).json({ 
      error: 'Repo not found.' 
    });
  }

  const repo = { id, title, url, techs };

  repositories[repoIndex] = repo;

  return response.json(repo);
});


//DELETE - Delete
app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id == id);

  if(repoIndex < 0 ) {
    return response.status(400).json({ 
      error: 'Repo not found.' 
    });
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});


//POST LIKE - Create Like
app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id == id);

  if(repoIndex < 0 ) {
    return response.status(400).json({ 
      error: 'Repo not found.' 
    });
  }

  const repo = repositories[repoIndex];

  const repoLikes = { 
    ...repo,
    likes: (repo.likes + 1),
  }

  repositories[repoIndex] = repoLikes;

  return response.status(200).json(repoLikes);
});


module.exports = app;
