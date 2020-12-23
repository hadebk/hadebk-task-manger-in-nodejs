const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

/**
 * mongoose middleware: let us execute some operation based on some events.
 * for ex: run some code before/after save document
 * to use this middleware function, i should use mongoose schema first
 */

// create user's schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password can't contain 'password'!");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be positive number!");
        }
      },
    },
    avatar: {
      // To show image in html by using buffer data => <img src='data:image/jpg;base64,IMAGEBUFFERFROMDB'>
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    // timestamps: give us time when new user created and last update for this user
    // user collection will include those to new properties(columns):
    //    1- createdAt
    //    2- updatedAt
    timestamps: true,
  }
);

// * virtual property will not stored in db
// add virtual property to user schema (add 'tasks' property to 'user' document)
// this done by create a relation between to collections 'Task','User'
// @par1: name of this property     @par2: config each field
userSchema.virtual("tasks", {
  ref: "Task", // to relate this field to 'Task' collection, should write the same name of collection model
  localField: "_id", // filed in this collection model that will be compared with the field (owner) in another collection (Task)
  foreignField: "owner", // filed in other collection model (foreign key) that i want to relate to (Task)
});

// this function to delete (password, tokens) when get user data from db
/**
 * this fun execute without invoke it! so how?
 *  - every time we pass an object to res.send() express use JSON.stringify() fun behind the scene.
 *  - toJSON(): let us access to property of this object and make some edit to them before sending the response.
 *  - in this case i delete some properties before sending the response.
 */
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar; // delete avatar buffer, because it is unnecessary large data

  return userObject;
};

// this function to generate auth token when user login (login operation)
// this line to can i access generateAuthToken() from User model instance(user) like 'user.generateAuthToken()'
userSchema.methods.generateAuthToken = async function () {
  // refer to user that about to be stored in db
  const user = this;
  // generate user token
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  // store user token in user's document in db
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// this function to verify email/pass provided by user (login operation)
// this line to can i access findByCredentials() from User model like 'User.findByCredentials()'
userSchema.statics.findByCredentials = async (email, password) => {
  // 1- find user by email
  const user = await User.findOne({ email });
  // 2- if user not found throw an error
  if (!user) throw new Error("Unable to login!");
  // 3- if user found, check the password
  const isMatch = await bcrypt.compare(password, user.password);
  // 4- if the password false throw an error
  if (!isMatch) throw new Error("Unable to login!");
  // 5- email & password are true => user is exist and email/pass are true
  return user;
};

// execute middleware function, event: before save user data => run some code(hash user password)
userSchema.pre("save", async function (next) {
  // refer to user that about to be stored in db
  const user = this;

  // check first if password was hashed or not
  // user.isModified('password') => will be true if when the user is first created (password was not hashed yet)
  if (user.isModified("password")) {
    // hash the password
    user.password = await bcrypt.hash(user.password, 8);
  }

  next(); // as a flag, that the work done, so add user to database
});

// execute middleware function, event: before delete user => delete user tasks
userSchema.pre("remove", async function (next) {
  // refer to user that about to be removed from db
  const user = this;
  // delete user tasks
  await Task.deleteMany({ owner: user._id });
  // done
  next();
});

/***********************************************************************************************
 * [ Mongoose Model ]
 * each model is a collection (table) in database.
 * after convert modal name to lowercase it will be the collection name (table name) in database.
 ************************************************************************************************
 */

/**
 * [ create user model ]
 * @param1 => model name
 * @param2 => definition of fields we want (columns in user table in db)
 */
// add Schema to user model
const User = mongoose.model("User", userSchema);

module.exports = User;
