// in progress
exports.getUserGroups = (socket) => {
  return Object.entries(groups).reduce((names, [name, group]) => {
    if (group.users[socket.id] != null) names.push(name);
    return names;
  }, []);
};
