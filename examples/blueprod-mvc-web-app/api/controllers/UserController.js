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

/**
 * @swagger1
 * /users
 *   get:
 *     summary: Returns users
 *     description: Returns users
 *     tags:
 *      - Users
 *     responses:
 *       200:
 *         description: users
 */
UserController.prototype.getUsers = async function (ctx, next) {
  ctx.body = users;
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Returns users
 *     description: Returns users
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: users
 */
UserController.prototype.createUser = async function (ctx, next) {
  users.push(ctx.body);
  ctx.body = users;
};

module.exports = new UserController();
