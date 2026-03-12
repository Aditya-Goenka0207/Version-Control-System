const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const url = process.env.MONGODB_URL;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(url);
    await client.connect();
  }
}

async function signup(req, res) {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await connectClient();
    const db = client.db("GithubClone");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      email,
      password: hashedPassword,
      repositories: [],
      followedUsers: [],
      starRepos: [],
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" },
    );

    res.status(201).json({ token , userId:result.insertedId.toString() });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("GithubClone");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const token = jwt.sign(
      { id: existingUser._id.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" },
    );

    return res.status(200).json({
      token,
      userId: existingUser._id.toString(),
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error!" });
  }
}

//in search results user views both users and their repos
async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("GithubClone");
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error during fetching:", err);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function getUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("GithubClone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(currentID) },
      { projection: { password: 0 } }, // exclude password
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error during fetching:", err);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("GithubClone");
    const usersCollection = db.collection("users");

    let updateFields = {};

    if (email) {
      updateFields.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(currentID) },
      { $set: updateFields },
      {
        returnDocument: "after",
        projection: { password: 0 },
      },
    );

    if (!result.value) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json(result.value);
  } catch (err) {
    console.error("Error during updation:", err);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("GithubClone");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({ message: "User profile deleted!" });
  } catch (err) {
    console.error("Error during deletion:", err);
    return res.status(500).json({ message: "Server error!" });
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
