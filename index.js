const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();

console.log(process.env.REACT_FRONTEND_URL);
const io = require("socket.io")(8900, {
  cors: {
    origin: process.env.REACT_FRONTEND_URL,
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  // connected
  console.log("a user connected");
  socket.emit("hello", "this is socket from port 8900 I amROBOT");
  // emit - send to client ("event name", "message or function")
  // take userid and socketid from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);

    io.emit("getUsers", users);
  });
  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    //send to specific user
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  // disconnected
  socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
