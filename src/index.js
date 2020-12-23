//-----------------------------------------------------------------------------------------------------------------
//                               [ Start point for our app, here we will init express server ]
//-----------------------------------------------------------------------------------------------------------------

const express = require("express");

// to start db connection
require("./db/mongoose");

// app routers
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

// server setup
const app = express();
const port = process.env.PORT;

// to parse coming data from server to json
app.use(express.json());
// register user's router
app.use(userRouter);
// register task's router
app.use(taskRouter);

// start server
app.listen(port, () => {
  console.log("Server is up on port" + port);
});