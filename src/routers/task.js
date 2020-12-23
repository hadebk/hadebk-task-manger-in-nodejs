const express = require("express");
// database model
const Task = require("../db_models/task");
// auth middleware
const auth = require("../middleware/auth");

// 1- crete a task's router
const router = new express.Router();

// 2- add task's routes
//-------------------------------------------------------------------------------------------------------------
//                                                  [ Task Routs ]
//-------------------------------------------------------------------------------------------------------------

//create new task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task); // task was created successfully
  } catch (e) {
    res.status(400).send(); // bad request
  }
});
//-------------------------------------------------------------------------------------------------------------
// read all tasks were created by current user
/**
 * [ data filtering ]
 * GET /tasks?completed=true/false => we need to apply filtering on tasks comes back from server
 * to get all tasks => /tasks
 * to get completed tasks => /tasks?completed=true
 * to get not completed tasks => /tasks?completed=false
 ********************************************************************
 * [ data pagination ]
 * GET /tasks?limit=10&skip=0 => will return first 10 tasks
 * GET /tasks?limit=10&skip=10 => will return second 10 tasks. And so on..
 * to get first 10 tasks => /tasks?limit=10
 * to get second 10 tasks => /tasks?limit=10&skip=10
 ********************************************************************
 * [ data sorting ]
 * GET /tasks?sortBy=createdAt:asc / createdAt:desc / completed:asc / or any other column..
 * to get all tasks in desc order by 'createdAt'  => /tasks?sortBy=createdAt:desc
 * to get completed tasks first then not completed tasks => /tasks?sortBy=completed:desc
 */
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true"; // if true => match = {completed: true} und vars via
  }

  // req.query.sortBy = createdAt:desc
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":"); // parts = [createdAt,desc]
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // sort = {createdAt: -1}
  }

  try {
    ////const tasks = await Task.find({ owner: req.user._id });
    // populate 'tasks' (virtual property) in 'user' collection to get all or a few tasks of current user
    await req.user
      .populate({
        path: "tasks",
        match, // match: uses for data filtering. If match have no value => it will return all tasks without any filtering
        options: {
          // options: uses for data pagination and sorting
          limit: parseInt(req.query.limit), // if limit not provided, it will be ignored by mongoose
          skip: parseInt(req.query.skip), // if skip not provided, it will be ignored by mongoose
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});
//-------------------------------------------------------------------------------------------------------------
// read one task
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // get one task, but that current user have created
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
//-------------------------------------------------------------------------------------------------------------
// delete a task by id
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
//-------------------------------------------------------------------------------------------------------------
// update a task by id
router.patch("/tasks/:id", auth, async (req, res) => {
  /**
   * [mongoose will ignore the foreign property on update, and will not throw an error]
   * the following a few lines of code are to handle this case
   */
  const updateProperties = Object.keys(req.body); // to get the keys of given updates object
  const allowedPropertiesUpdates = ["description", "completed"]; // default allowed properties
  // check if every given property from task, is valid or not
  const isValidProperty = updateProperties.every((property) => {
    return allowedPropertiesUpdates.includes(property);
  });

  if (!isValidProperty) return res.status(400).send("Error: Invalid updates!");

  try {
    // should use .save() approach to run middleware before update user data (to hash the pass first)

    // get task that has created by current user
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).send();

    updateProperties.forEach(
      (property) => (task[property] = req.body[property])
    );

    await task.save();

    /* by this way middleware with event (save) will not be executed!
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    */
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
//-------------------------------------------------------------------------------------------------------------
// 3- export task's router, to use it in index.js
module.exports = router;
