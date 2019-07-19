'use strict';

const ProjectController = function () {
};

const projects = [
  {
    _id: "1",
    username: "project 1",
  },
  {
    _id: "2",
    username: "project 2",
  }
];

ProjectController.prototype.getProjects = async function (ctx, next) {
  ctx.body = projects;
};

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Update project
 *     description: Update project
 *     tags: [Projects]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: users
 */
ProjectController.prototype.createProject = async function (ctx, next) {
  projects.push(ctx.body);
  ctx.body = projects;
};


module.exports = new ProjectController();
