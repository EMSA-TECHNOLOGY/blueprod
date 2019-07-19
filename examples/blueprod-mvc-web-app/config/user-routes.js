module.exports.routes = {
  'GET   /v1/users': 'user.getUsers',
  'GET   /v1/users-json': 'user.getUsers',
  'GET   /login': {
    view: 'user/login', viewType: "ejs", layout: 'login-layout'
  },

  /**
   * @controller
   * @swagger
   * /users:
   *   post:
   *     summary: Update user
   *     description: Update user
   *     tags: [User]
   *     parameters:
   *       - $ref: '#/parameters/username'
   *     responses:
   *       200:
   *         description: create a user
   */
  'POST  /login': {
    controller: 'user.createUser'
  }
};
