require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const path = require("path");
const { PORT, mongo_uri } = require("../constanst");
const { getUserGroups } = require("./services/user-groups");

app.set("views", "./views");
app.set("view engine", "ejs");
app.use("/services", express.static(path.join(__dirname + "/services")));
app.use(express.urlencoded({ extended: true }));

app.use(express.json({ extended: false })); // allows us to get data in req.body for console

// not a good practice but will do for now
const groups = {};

mongoose
  .connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.error(err));

// Get request
app.get("/", (req, res) => res.send("Messaging app v1.0"));

app.use("/user", require("./controllers/users"));

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.get("/chat", (req, res) => {
  res.render("index", { groups: groups });
});

app.post("/group", (req, res) => {
  if (groups[req.body.group] != null) {
    return res.redirect("/");
  }
  groups[req.body.group] = { users: {} };
  res.redirect(req.body.group);
  // Send message that new group was created
  io.emit("group-created", req.body.group);
});

app.get("/:group", (req, res) => {
  if (groups[req.params.group] == null) {
    return res.redirect("/");
  }
  res.render("group", { groupName: req.params.group });
});

io.on("connection", (socket) => {
  console.log("connection made");
  socket.on("new-user", (group, name) => {
    socket.join(group);
    groups[group].users[socket.id] = name;
    socket.to(group).broadcast.emit("user-connected", name);
  });
  socket.on("send-chat-message", (group, message) => {
    socket.to(group).broadcast.emit("chat-message", {
      message: message,
      name: groups[group].users[socket.id],
    });
  });
  socket.on("disconnect", () => {
    console.log("connection closed");
    getUserGroups(socket).map((group) => {
      socket
        .to(group)
        .broadcast.emit("user-disconnected", groups[group].users[socket.id]);
      delete groups[group].users[socket.id];
    });
  });
});
