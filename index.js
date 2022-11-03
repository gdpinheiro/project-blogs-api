const express = require('express');
const bodyParser = require('body-parser');

const usersController = require('./controllers/usersController');
const loginController = require('./controllers/loginController.js');
const categoriesController = require('./controllers/categoriesController');
const postsController = require('./controllers/postsController');

const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(bodyParser.json());

app.use('/user', usersController);

app.use('/login', loginController);

app.use('/categories', categoriesController);

app.use('/post', postsController);

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (request, response) => {
  response.send();
});

app.use(errorMiddleware);

app.listen(3000, () => console.log('ouvindo porta 3000!'));
