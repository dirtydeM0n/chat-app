const express = require("express");
const mongoose = require("mongoose");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const { PORT, mongo_uri } = require("../constanst");
const { getUserGroups } = require("./services/user-groups");

app.use(express.json({ extended: false })); // allows us to get data in req.body for console

mongoose
  .connect(mongo_uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true, // deprecated
    useFindAndModify: false, // because findOneAndUpdate is deprecated
  })
  .catch((err) => console.error(err));

// Get request
app.get("/", (req, res) => res.send("Messaging app v1.0"));

app.use("/user", require("./controllers/users"));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// not a good practice but will do for now
const groups = {};

io.on("connection", (socket) => {
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
    getUserGroups(socket).map((group) => {
      socket
        .to(group)
        .broadcast.emit("user-disconnected", groups[group].users[socket.id]);
      delete groups[group].users[socket.id];
    });
  });
});
