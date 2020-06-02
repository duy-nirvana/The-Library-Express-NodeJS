const express = require('express');
const app = express();
const shortid = require('shortid');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

const port = 3001;

app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

db.defaults({ users: [] })
  .write()

app.get('/', (req, res) => {
  res.render('index', {
    name: 'Duy Tran',
  });
});

app.get('/books', (req, res) => {
  res.render('books/index', {
    books: db.get('books').value()
  })
})

app.get('/books/search', (req, res) => {
  const q = req.query.q;

  const matchedBooks = db.get('books').value().filter(user => {
    return user.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  })

  res.render('books/index', {
    books: matchedBooks,
  })
})

app.get('/books/create', (req, res) => {
  res.render('books/create');
})

app.get('/books/:id/view', (req, res) => {
  const id = req.params.id;

  const book = db.get('books').find({ id: id }).value();
  res.render('books/view', {
    book: book,
  })
})

app.get('/books/:id/delete', (req, res) => {
  const id = req.params.id;
  const book = db.get('books').remove({ id: id }).write();

  res.redirect('/books');
})

app.get('/books/:id/update', (req, res) => {
  res.render('books/update');
})

app.post('/books/:id/update', (req, res) => {
  const id = req.params.id;
  let name = req.body.name;

  db.get('books')
    .find({id: id})
    .assign({name: name})
    .write()
  
  res.redirect('/books');
})

app.post('/books/create', (req, res) => {
  req.body.id = shortid.generate();

  db.get('books').push(req.body).write();
  res.redirect('/books');
})

app.listen(port, () => console.log(`Server listening on port ${port}`));

