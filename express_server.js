const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = function() {
  let alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
};

const httpify = function(link) {
  let output = link;
  if (output.substring(0, 4) === "www.") {
    output = "http://" + link;
  }
  if (output.substring(0, 11) !== "http://www." && output.substring(0, 12) !== "https://www.") {
    output = "http://www." + link;
  }
  return output;
};

const emailLookup = function(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return false;
};


app.post("/login", (req, res) => {
  if (!emailLookup(req.body.email)) {
    res.status(403).send("Error - email not found.");
  }
  if (req.body.password !== emailLookup(req.body.email).password) {
    res.status(403).send("Error - incorrect password.");
  }
  res.cookie("user_id", emailLookup(req.body.email).id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('urls');
});

app.post("/register", (req, res) => {
  if (req.body.email === "") {
    res.status(400).send("Error - email left blank.");
  }
  if (req.body.password === "") {
    res.status(400).send("Error - password left blank.");
  }
  if (emailLookup(req.body.email)) {
    res.status(400).send("Error - email already registered.");
  }
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", newID);
  console.log(users);
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send(`Error 404 - ${req.params.shortURL} not found.`);
  }

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  console.log(req.body); // Log the POST request body to the console
  let newShort = generateRandomString();
  urlDatabase[newShort] = httpify(req.body.longURL);
  res.redirect(`/urls/${newShort}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = httpify(req.body.longURL);
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
