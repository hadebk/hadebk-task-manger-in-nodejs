// to make request and test our app
const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/db_models/task");
const User = require("../src/db_models/user");
const {
  userOneId,
  userTowId,
  userOne,
  userTow,
  taskOne,
  taskTow,
  taskThree,
  setupDatabase,
} = require("./fixtures/db");

// this fun running first, before run any test case
beforeEach(setupDatabase);

//----------------------------------------------------------------
// test create new task route
test("Should create a new task", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "From my test",
    })
    .expect(201);

  // verify if task created correctly
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  // verify if task was stored with => completed: false
  expect(task.completed).toEqual(false);
});
//----------------------------------------------------------------
// test get user's tasks route
test("Should fetch user tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  // check the length of tasks of userOne to be 2
  expect(response.body.length).toEqual(2);
});
//----------------------------------------------------------------
// test delete task security
test("Should not delete task by another user", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTow.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
//----------------------------------------------------------------

// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks
