module.exports = {
  mongo_uri: process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
  socket_url: process.env.SOCKET_URL,
};
