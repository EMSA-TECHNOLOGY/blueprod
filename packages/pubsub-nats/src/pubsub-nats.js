/*#*
***************************************************************************************************
** Copyright © 2019 EMSA TECHNOLOGY COMPANY LTD and ÉOLANE - All Rights Reserved.
**
** This software is the proprietary information of EMSA TECHNOLOGY COMPANY LTD and ÉOLANE. Unauthorized
** copying of this file, via any medium is strictly prohibited proprietary and confidential.
**
** File:         DistributedEventService.js
** Version:      0.1
** Created:      2019/09/24 09:00:00 (GMT+7)
** Author:       <href="mailto:khanhnq@emsa-technology.com"> Khanh NGUYEN</a>
**
** Description:
***************
** A service for listening events from other processes/nodes.
**
** History:
***********
** Version 0.1  2019/09/24 09:00:00  khanhnq
**   + Creation and implementation.
***************************************************************************************************
*#*/

/** @module DistributedEventService */

'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const process = require('process');
const pubsubModules = require("nats");

let pubsubService = null;
let sid;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const COMPONENT_NAME = 'PubSubNatsEventService';

const constants = {
  /* To add constants here */
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const PubSubNatsEventService = function () {
  this.serviceName = COMPONENT_NAME;
  pubsubService = pubsubModules.connect();
};

PubSubNatsEventService.constants = constants;

// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION --                                                      |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = new PubSubNatsEventService();

// ┌───────────────────────────────────────────────────────────────────────────┐
// | EXPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION ++                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

PubSubNatsEventService.prototype.getInstance = function () {
  const self = this;
  if (!self || pubsubService === null) {
    return new PubSubNatsEventService();
  }

  return self;
};

/**
 *
 * @param topic
 * @param listener
 * @return {boolean}
 */
PubSubNatsEventService.prototype.on = function (topic, cb, listener) {
  sid = pubsubService.subscribe(topic, function(msg) {
    cb(JSON.parse(msg));
  });
};

PubSubNatsEventService.prototype.emit = function (topic, eventData) {
  // const self = this;
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };
  pubsubService.publish(topic, JSON.stringify(event));
};

PubSubNatsEventService.prototype.unsubscribe = function () {
  pubsubService.unsubscribe(sid);
};


// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘

