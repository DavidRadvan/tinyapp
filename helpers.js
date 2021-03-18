const emailLookup = function(email, database) {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return false;
};

const generateRandomString = function() {
  let alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
};

const hasVisited = function(userId, database) {
  for (let i = 0; i < database.length; i++) {
    for (let j = 0; j < database[i].length; j++) {
      if (userId === database[i][j]) {
        return true;
      }
    }
  }
  return false;
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

const urlsForUser = function(id, database) {
  let output = {};
  for (let url in database) {
    if (id === database[url].userID) {
      output[url] = database[url];
    }
  }
  return output;
};

module.exports = { emailLookup, generateRandomString, hasVisited, httpify, urlsForUser };
