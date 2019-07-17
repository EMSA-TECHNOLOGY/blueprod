'use strict';

const USER_TO_KOA_VERB = {
  'GET':    'get',
  'get':    'get',
  'POST':   'post',
  'post':   'post',
  'PUT':    'put',
  'put':    'put',
  'DELETE': 'del',
  'delete': 'del',
  'DEL':    'del',
  'del':    'del',
  'ALL':    'all',
  'all':    'all',
  'HEAD':   'all',
  'head':   'all',
};

exports.userVerb2KoaVerb = (userVerb) => {
  return USER_TO_KOA_VERB[userVerb];
};

// exports.KOA_VERB = ['get', 'post', 'put', 'del', 'all'];
