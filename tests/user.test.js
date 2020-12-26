// to make request and test our app
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/db_models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

// this fun running first, before run any test case
beforeEach(setupDatabase);

//------------------------------------------------------------------------
// test create user route
test("Should sign up a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Mike",
      email: "mike@example.com",
      password: "mike12345",
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertion about the response
  expect(response.body).toMatchObject({
    user: {
      name: "Mike",
      email: "mike@example.com",
    },
    token: user.tokens[0].token,
  });
  // verify that user password not stored as a plain text
  expect(user.password).not.toBe("mike12345");
});
//------------------------------------------------------------------------
// test user login route
test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  const user = await User.findById(response.body.user._id);
  // validate new token is saved
  expect(response.body.token).toBe(user.tokens[1].token);
});
//------------------------------------------------------------------------
// test login route with nonexisting user
test("Should not login nonexisting user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "wrongPassword",
    })
    .expect(400);
});
//------------------------------------------------------------------------
// test get user profile route
test("Should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});
//------------------------------------------------------------------------
// test get user profile with not auth case
test("Should not get user profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});
//------------------------------------------------------------------------
// test delete user route
test("Should delete user account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  // validate that the user was removed from database correctly
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});
//------------------------------------------------------------------------
// test delete unauthorized user
test("Should not delete unauthorized user account", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
//------------------------------------------------------------------------
// test upload user avatar image route
test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  // verify if image was uploaded correctly to that user
  const user = await User.findById(userOneId);
  // check if user.avatar data type is Buffer, if it's Buffer so the avatar was uploaded correctly!
  expect(user.avatar).toEqual(expect.any(Buffer));
});
//------------------------------------------------------------------------
// test update user data route
test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "userUpdate",
    })
    .expect(200);

  // verify if user name was changed correctly or not
  const user = await User.findById(userOneId);
  expect(user.name).toEqual("userUpdate");
});
//------------------------------------------------------------------------
// test if update user data route, will not accept foreign fields.
test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "someLocation",
    })
    .expect(400);
});
//------------------------------------------------------------------------

// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated

// this fun running last, after run all test case
// afterEach(() => {});
