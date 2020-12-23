const express = require("express");
// database model
const User = require("../db_models/user");
// auth middleware
const auth = require("../middleware/auth");
// Multer is a node.js middleware for handling multipart/form-data,
// which is primarily used for uploading files.
const multer = require("multer");
// sharp is to convert large images in common formats to smaller
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

// 1- crete a user's router
const router = new express.Router();

// 2- add user's routes
//-----------------------------------------------------------------------------------------------------------------
//                                                  [ User Routs ]
//-----------------------------------------------------------------------------------------------------------------

// create new user / sign up
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    // generate token to signed up user
    const token = await user.generateAuthToken();
    // user was created successfully
    res.status(201).send({ user, token }); // will be executed, just after save() is done
  } catch (e) {
    res.status(400).send(e); // bad request
  }
});
//-----------------------------------------------------------------------------------------------------------------
// log in user
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});
//-----------------------------------------------------------------------------------------------------------------
// log out user, just from current session (current device)
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
//-----------------------------------------------------------------------------------------------------------------
// log out user from all sessions (all devices)
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
//-----------------------------------------------------------------------------------------------------------------
// read current user profile data, this route will run only if user is authenticated
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});
//-----------------------------------------------------------------------------------------------------------------
// delete a user
router.delete("/users/me", auth, async (req, res) => {
  try {
    // remove() is a mongoose fun. I use .remove() till i can execute middleware fun with event 'remove',
    // and this middleware is to delete user tasks before delete user.
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});
//-----------------------------------------------------------------------------------------------------------------
// update a user by id
router.patch("/users/me", auth, async (req, res) => {
  /**
   * [mongoose will ignore the foreign property on update, and will not throw an error]
   * the following few lines of code are to handle this case
   */
  const updateProperties = Object.keys(req.body); // to get the keys of given updates object
  const allowedPropertiesUpdates = ["name", "email", "age", "password"]; // default allowed properties
  // check if every given property from user, is valid or not
  const isValidProperty = updateProperties.every((property) => {
    return allowedPropertiesUpdates.includes(property);
  });

  if (!isValidProperty) return res.status(400).send("Error: Invalid updates!");

  try {
    /**
     *  by this way middleware with event (save) will not be executed!
     * const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators: true});
     * so i use .save() event => to run middleware with event (save) before update user data (to hash the pass first)
     */

    // get user from auth func
    const user = req.user;

    updateProperties.forEach(
      (property) => (user[property] = req.body[property])
    );

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});
//-----------------------------------------------------------------------------------------------------------------
// upload user avatar image, can be used to add or update user avatar
// dest: is directory name (where the uploaded image will be saved)
const upload = multer({
  // dest: 'avatars'
  limits: {
    fileSize: 1000000, // 1000000 byte = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image."));
    }
    // there is no error so send the request
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  //upload.single() is a middleware, receive string and this string will be the key name,
  // key that i will use to get file value (form-data) that will be uploaded.
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    // print any error comes from 'upload' middleware
    res.status(400).send({ error: error.message });
  }
);
//-----------------------------------------------------------------------------------------------------------------
// delete user avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});
//-----------------------------------------------------------------------------------------------------------------
// get avatar buffer from db and generate image url
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      return new Error("User not found or not have an avatar.");
    }
    // set response header, set response data type as 'image' until frontend can read the avatar as url n ot as a buffer data.
    res.set("Content-Type", "image/png");
    res.send(user.avatar); // return avatar url can be used easily in frontend
  } catch (e) {
    res.status(404).send();
  }
});
//-----------------------------------------------------------------------------------------------------------------

// 3- export user's router, to use it in index.js
module.exports = router;
