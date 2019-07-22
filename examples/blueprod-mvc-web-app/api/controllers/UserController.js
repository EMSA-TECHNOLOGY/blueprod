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
 * components:
 *   requestBodies:
 *     createdUser:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/newUserTemplate'
 *         application/xml:
 *           schema:
 *             $ref: '#/components/schemas/newUserTemplate'
 *   schemas:
 *     newUserTemplate:
 *       type: object
 *       description: model for one user
 *       required: [username, email, firstName, lastName, password]
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         birthday:
 *           type: string
 *           format: date
 *         gender:
 *           enum: [male, female]
 *         nationality:
 *           type: string
 *         lang:
 *           type: string
 *         companyCode:
 *           type: string
 *         companyId:
 *           type: string
 *         userType:
 *           type: string
 *         status:
 *           type: string
 *         isAdmin:
 *           type: boolean
 *         password:
 *           type: string
 *         phones:
 *           type: string
 *           pattern: '(\+84)+([0-9]{9,10})\b'
 *         addresses:
 *           type: string
 *         emails:
 *           type: array
 *           items:
 *             type: object
 *         metadata:
 *           type: object
 *         images:
 *           type: string
 *         aam:
 *           type: number
 *         location:
 *           type: string
 *         roles:
 *           type: array
 *           items:
 *             type: object
 *         _custom:
 *           type: object
 *         tz:
 *           type: string
 *         mailLoginToUser:
 *           type: string
 *         randomPassword:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user
 *     description: Create user
 *     tags:
 *       - Users
 *     requestBody:
 *       $ref: '#/components/requestBodies/createdUser'
 *     responses:
 *       200:
 *         description: Create user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID.
 *                 username:
 *                   type: string
 *                   description: The user name.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Permission denied
 *       404:
 *         description: Not found
 *       5XX:
 *         description: Unexpected error.
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
