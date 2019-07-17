#!/bin/bash

# node index.js

sleep 2

if ! type "$autocannon" > /dev/null; then
  echo "autocannon does not exist, installing..."
  # install foobar here
  npm install -g autocannon
fi

echo "Start to run performance test...."
autocannon -c 100 -d 40 -p 10 localhost:21400/hello
