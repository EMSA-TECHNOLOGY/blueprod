# This will publish all changed modules

lerna clean
lerna bootstrap
lerna publish from-package --no-git-tag-version