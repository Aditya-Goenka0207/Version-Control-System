require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router.js");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

yargs(hideBin(process.argv))
  .command("start", "Start a new server", {}, startServer)
  .command(
    "init", //command
    "Initialise a new repository", //description
    {}, //parameters
    initRepo, //function to perform
  )
  .command(
    "add <file>", //command
    "Add a file to the repository", //description
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    }, //parameters
    (argv) => {
      addRepo(argv.file);
    }, //function to perform
  )
  .command(
    "commit <message>", //command
    "Commit the staged files", //description
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit Message",
        type: "string",
      });
    }, //parameters
    (argv) => {
      commitRepo(argv.message);
    }, //function to perform
  )
  .command(
    "push", //command
    "Push commits to S3", //description
    {}, //parameters
    pushRepo, //function to perform
  )
  .command(
    "pull", //command
    "Pull commits from S3", //description
    {}, //parameters
    pullRepo, //function to perform
  )
  .command(
    "revert <commitID>", //command
    "Revert to a specific commit", //description
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      }); //parameters
    },
    (argv) => {
      revertRepo(argv.commitID); //function to perform
    },
  )
  .demandCommand(1, "You need at least one command")
  .strict() //prevents invalid commands
  .recommendCommands()
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use("/", mainRouter);

  const mongoURL = process.env.MONGODB_URL;
  mongoose
    .connect(mongoURL)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("Unable to connect to DB : ", err));

  let user = "test";

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      user = userID;
      console.log("-----");
      console.log(user);
      console.log("-----");
      socket.join(userID);
    });
  });

  const db = mongoose.connection;

  db.once("open", async () => {
    console.log("CRUD operations called");
    //CRUD operations
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
  });
}
