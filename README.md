# task-manger-in-nodejs

Create RESTFUL API to serve all operation in Task Manger App, and execute all CURD operation on MongoDB.  
This is a back-end task manager application made with JavaScript, Node.js, Express, MongoDB and Mongoose.js. It allows you to create an account through the API and manage tasks that you can add, view, edit or delete.  
The main goal was to work with a NoSQL database and build a simple API that could be used for a task manager application. Users can create accounts, login, logout, add and delete profile avatars as well as create and manage tasks they create. It completes all of the main objectives and I feel confident building and maintaining a NoSQL database now.

### Technologies used
- Node.js and Express.js to setup the server and create API routes.
- MongoDB and Mongoose as a database to store users and tasks data.
- Jest.js to apply some test cases to the app.

### Additional Dependencies
- @sendgrid/mail - used to send welcome and cancellation emails
- bcryptjs - used for hashing
- jsonwebtoken - tokens used to authentication
- multer - used for setting requirements for uploading avatars
- sharp - used to resize avatars when saving to DB
- validator - used to validate fields like email

### Environment Setup And Run Locally
1- Run npm install
2- create dev.env file in top folder directory and add this values:
    - PORT=3000
    - JWT_SECRET=YOUR_JWT_SECRET_VALUE
    - SENDGRID_API_KEY=YOUR_API_KEY_HERE
    - MONGODB_URL=mongodb://127.0.0.1:27017/your-app-name
3- Create test.env file in top folder directory and add this values:#
    - PORT=3000
    - JWT_SECRET=YOUR_JWT_SECRET_VALUE
    - SENDGRID_API_KEY=YOUR_API_KEY_HERE
    - MONGODB_URL=mongodb://127.0.0.1:27017/your-app-name-test
4- Start mongodb run: /YOUR_PATH/mongodb/bin/mongod.exe
5- Start the project run: npm run dev
6- To execute tests run: npm test

### What I have done in this project
- setup express server.
- API authentication and security.
- create API endpoints and add some express middleware (auth).
- work with JWT to create user token and verify it later.
- create mongoose models for database collections and use Mongoose Schema and middleware on model.
- execute CURD operation using Mongoose and handle relationships between collections.
- upload file type data (image) to MongoDB and set the validation + execute some edits on image before save it to db.
- apply sorting, pagination, and filtering on read all tasks route.
- send email on create or delete user using sendgrid.
- create environment variables to store some sensitive data.
- work with postman (collections, dev/prod environments, variables and js script to update a var on receive new value).
- create a production MongoDB database (online db for production).
- upload API to heroku (online API for production).
- write many test cases in jest.js to test many functions in the app.

### Using the API
#### User Routes
- Create user account - POST /users - name, email and password are required.
- Read user account info - GET /users/me - Auth required (userToken).
- Update user account - PATCH /users/me - Auth required (userToken).
- Delete user account - DELETE /users/me - Auth required (userToken).
- Login user - POST /users/login - email and password must be provided.
- Logout user (most recent session only) - POST /users/logout - Auth required (userToken).
- Logout user from all instances - POST /users/logoutall - Auth required (userToken).
- Add user avatar - POST /users/me/avatar - Auth required (userToken).
- Delete user avatar - DELETE /users/me/avatar - Auth required (userToken).
- View users avatar by user id - GET /users/:id/avatar - requires users id.

#### Task Routes
- Create new task - POST /tasks - requires auth and task description optional completed value can be provided.
- Read task by task id - GET /tasks/:id - requires tasks id and Auth.
- Update task by id - PATCH /tasks/:id - requires tasks id and Auth.
- Delete task by id - DELETE /tasks/:id - requires tasks id and Auth.
- Read all tasks (queries available) - GET /tasks? - requires Auth, all queries are optional.
  Query options available:
    - completed=false - can search by completed field, either true or false
    - limit=1 - can limit number of results sent back
    - skip=1 - can skip results
    - sortBy=desc - can sort results in ascending or descending order