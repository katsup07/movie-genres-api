const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const auth = require('../middleware/auth');
const { User, validateUser } = require('../models/User');

const router = express.Router();
/* Get all users */
router.get('/', auth, async (req, res) => {
  // ! Delete this later. It's just for development purposes.
  const users = await User.find().catch((err) => res.send(err));
  res.send(users);
});

/* Get a user */
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .catch((err) => res.send(err));
  res.send(user);
});

/* Add new users */
router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  // use findOne when looking up by properties
  const foundUser = await User.findOne({ email: req.body.email }).catch((err) =>
    res.send(err)
  );
  if (foundUser) return res.status(400).send('User already registered!');

  const newUser = new User(_.pick(req.body, ['name', 'email', 'password'])); // see note below

  // Adding salt and hashing the password
  const salt = await bcrypt.genSalt(10); // make salt
  const hashedPassword = await bcrypt.hash(newUser.password, salt); // hash password
  newUser.password = hashedPassword;

  await newUser.save().catch((err) => res.send(err));
  const token = newUser.generateAuthToken();

  res // set header and send response to client
    .header('x-auth-token', token) // res.header( 'nameOfHeader', value ) //  prefix custom headers with 'x-'
    // need to set this header below so client can read the custom header above. It will 'expose' the header above.
    .header('access-control-expose-headers', 'x-auth-token')
    .send(_.pick(newUser, ['_id', 'name', 'email'])); // give object, 'newUser', and array of properties to pick.
}); // See notes below for alternate way to do this part

module.exports = router;

// @ Notes
// This works too for checking if user is already registered
/* // @ 1. Check if email is already in use.
  const users = await User.find().catch((err) => res.send(err));
  const foundUser = users.find((u) => (u.email === req.body.email ? u : ''));
  if (foundUser)
    return res.status(400).send('There is already a user with that email!');
 */

// @ 2. Two ways to define user - with and without lodash
// const newUser = new User(_.pick(req.body, ['name', 'email', 'password'])); // see note below

// Above is the same as this, but without lodash.
/*   const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  }); */
// @ 2. Send name and email back
// Can send back the response like this without sending password as well
/*     res.send({
      name: newUser.name,
      email: newUser.email,
    }); */

// @ 3. Ensure passwords are more complex with various types of characters: numbers, letters, special, uppercase etc.
/* https://www.npmjs.com/package/joi-password-complexity */
