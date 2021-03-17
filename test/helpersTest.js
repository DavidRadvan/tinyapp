const {
  assert
} = require('chai');

const helper = require('../helpers.js');

const testUsers = {
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

describe('emailLookup', function() {
  it('should return a user with valid email', function() {
    const user = helper.emailLookup("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it('should return undefined if user is not in database', function() {
    const user = helper.emailLookup("usernotindb@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user.id, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should generate a random unique string', function() {
    const randString1 = helper.generateRandomString();
    const randString2 = helper.generateRandomString();
    const compare = (randString1 !== randString2);
    assert.strictEqual(compare, true);
  });

  it('random string should be six characters', function() {
    const randString = helper.generateRandomString();
    assert.strictEqual(randString.length, 6);
  });
});

describe('httpify', function() {
  it('should add http:// if not already present', function() {
    const url = helper.httpify("www.youtube.com");
    assert.strictEqual(url, "http://www.youtube.com");
  });

  it('should add http://www. if not present', function() {
    const url = helper.httpify("youtube.com");
    assert.strictEqual(url, "http://www.youtube.com");
  });

  it('should do nothing if url is already in correct form', function() {
    const url = helper.httpify("http://www.youtube.com");
    assert.strictEqual(url, "http://www.youtube.com");
  });
});

describe('urlsForUser', function() {
  const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "randString"
    }
  };
  it('should retrieve urls owned by user', function() {
    const urlsOwned = helper.urlsForUser("randString", urlDatabase);
    assert.strictEqual(urlsOwned.i3BoGr.longURL, "https://www.google.ca");
  });

  it('should return undefined if no urls owned by user', function() {
    const emptyUrls = helper.urlsForUser("notHere", urlDatabase);
    assert.strictEqual(emptyUrls.length, undefined);
  });
});
