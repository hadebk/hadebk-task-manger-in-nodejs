/**
 * Mongoose used to set validations and other things to our database collections
 * start connection from cmd : /User/Dell/mongodb/bin/mongod.exe
 */


const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify:false
});

