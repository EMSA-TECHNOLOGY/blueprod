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
 * @swagger
 * tags:
 *   - name: Users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     user:
 *       type: object
 *       description: model for one user
 *       required:
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         company:
 *           type: string
 *         mobile:
 *           type: string
 *           pattern: '(\+84)+([0-9]{9,10})\b'
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 2
 *           maxLength: 10
 * /users:
 *   get:
 *     summary: Returns users
 *     description: Returns users
 *     tags:
 *       - Users
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
 *       - Users
 *     responses:
 *       200:
 *         description: users
 */
UserController.prototype.createUser = async function (ctx, next) {
  users.push(ctx.body);
  ctx.body = users;
};

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: create user
 *     description: create user before use application
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *     responses:
 *       200:
 *         description: created user
 */
UserController.prototype.signUp = async function (ctx, next) {
  users.push(ctx.body);
  ctx.body = users;
};

module.exports = new UserController();
