const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const helper = require('./helpers.js');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(methodOverride('_method'));

app.set("view engine", "ejs");

const urlDatabase = {};

const users = {};


app.post("/login", (req, res) => {
  if (!helper.emailLookup(req.body.email, users)) {
    res.status(403).send("Error - email not found.");
  }
  if (!bcrypt.compareSync(req.body.password, helper.emailLookup(req.body.email, users).password)) {
    res.status(403).send("Error - incorrect password.");
  }
  req.session.userId = helper.emailLookup(req.body.email, users).id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('urls');
});

app.post("/register", (req, res) => {
  if (req.body.email === "") {
    res.status(400).send("Error - email left blank.");
  }
  if (req.body.password === "") {
    res.status(400).send("Error - password left blank.");
  }
  if (helper.emailLookup(req.body.email, users)) {
    res.status(400).send("Error - email already registered.");
  }
  let newID = helper.generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.userId = newID;
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: helper.urlsForUser(req.session.userId, urlDatabase),
    user: users[req.session.userId]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.userId]) {
    res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.userId],
      wrongUser: function() {
        let output = false;
        if (!helper.urlsForUser(req.session.userId, urlDatabase)[req.params.shortURL]) {
          output = true;
        }
        return output;
      }
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send(`Error 404 - ${req.params.shortURL} not found.`);
  }

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let newShort = helper.generateRandomString();
  urlDatabase[newShort] = {
    longURL: helper.httpify(req.body.longURL),
    userID: req.session.userId
  };
  res.redirect(`/urls/${newShort}`);
});

app.put("/urls/:id", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = helper.httpify(req.body.longURL);
  }
  res.redirect(`/urls/${req.params.id}`);
});

app.delete("/urls/:shortURL", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyURL server listening on port ${PORT}!`);
});
