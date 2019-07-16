'use strict';

// Thanh LE
// A middleware to create the context object for websocket if there is a websocket supported.

//IMPORTANT: IN FACT, WEBSOCKET INBOUND IS NOT EXECUTED WITH CONFIGURED KOA MIDDLEWARES

module.exports = function (wsApp) {
  return function mContextCreator(socket, next) {
    const ctx = wsApp.app.createContext(socket.request, socket.response);
    socket.session = ctx.session;
    next();
  }
};
