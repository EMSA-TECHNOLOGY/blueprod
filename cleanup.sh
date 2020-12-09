#!/bin/bash

# This utility script is going to:
#   Delete all node_modules
#   Delete all package-lock.json file

find . -name "node_modules" -print0 | xargs -0 rm -rf
find . -name "package-lock.json" -print0 | xargs -0 rm -rf
find . -name "yarn.json" -print0 | xargs -0 rm -rf
