'use strict';

const UserController = function () {
};

const users = [
  {
    _id: "1",
    username: "user 1",
  },
  {
    _id: "2",
    username: "user 2",
  }
];

UserController.prototype.getUsers = async function (ctx, next) {
  ctx.body = users;
};

module.exports = new UserController();
