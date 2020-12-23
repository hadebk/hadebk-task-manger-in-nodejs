const mongoose = require("mongoose");

/***********************************************************************************************
 * [ Mongoose Model ]
 * each model is a collection (table) in database.
 * after convert modal name to lowercase it will be the collection name (table name) in database.
 ************************************************************************************************
 */

// create task's schema
const taskSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true, required: true },
    completed: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId, // object id of user, who have created this task
      require: true,
      ref: "User", // to relate this field to 'User' collection, should write the same name of collection model
    },
  },
  {
    // timestamps: give us time when new user created and last update for this user
    // user collection will include those to new properties(columns):
    //    1- createdAt
    //    2- updatedAt
    timestamps: true,
  }
);

/**
 * [ create task model ]
 * @param1 => model name
 * @param2 => definition of fields we want
 */
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
