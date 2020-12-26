const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/db_models/user");
const Task = require("../../src/db_models/task");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "userOne",
  email: "userOne@example.com",
  password: "userOne12345",
  tokens: [
    {
      token: jwt.sign(
        {
          _id: userOneId,
        },
        process.env.JWT_SECRET
      ),
    },
  ],
};

const userTowId = new mongoose.Types.ObjectId();
const userTow = {
  _id: userTowId,
  name: "userTow",
  email: "userTow@example.com",
  password: "userTow12345",
  tokens: [
    {
      token: jwt.sign(
        {
          _id: userTowId,
        },
        process.env.JWT_SECRET
      ),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "UserOne first task from test",
  completed: false,
  owner: userOneId,
};

const taskTow = {
  _id: new mongoose.Types.ObjectId(),
  description: "UserOne seconde task from test",
  completed: true,
  owner: userOneId,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "UserTow first task from test",
  completed: true,
  owner: userTowId,
};

const setupDatabase = async () => {
  // clean users/tasks collection in db before each time the test cases running
  await User.deleteMany({});
  await Task.deleteMany({});

  // add users/tasks in users/tasks collections in db
  await new User(userOne).save();
  await new User(userTow).save();
  await new Task(taskOne).save();
  await new Task(taskTow).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userTowId,
  userOne,
  userTow,
  taskOne,
  taskTow,
  taskThree,
  setupDatabase,
};
