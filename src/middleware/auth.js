const jwt = require("jsonwebtoken");
const User = require("../db_models/user");

const auth = async (req, res, next) => {
  try {
    // 1- get token from request header
    const token = req.header("Authorization").replace("Bearer ", "");
    // 2- verify token, check if it valid or not
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // 3- if token is valid get current user data
    // decodedToken._id = user id (i have added it to token, when i have generated the token)
    const user = await User.findOne({
      _id: decodedToken._id,
      "tokens.token": token,
    });

    if (!user) throw new Error("User not found.");
    // give any route handler that use this middleware, access to user data
    // store user property on 'req', so the route handler can read user data by invoking this property
    req.user = user;
    req.token = token;
    // run route handler
    next();
  } catch (e) {
    res.status(401).send({ Error: "Please authenticate." });
  }
};

module.exports = auth;
