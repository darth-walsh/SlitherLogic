#!/bin/bash

if echo $1 | grep "^[0-9]\+\.[0-9]\+$" > /dev/null ;
then
  echo "copying to directory $1..."
else
  echo "usage: $0 N.N"
  exit 1
fi

rm -r ~/Documents/Programming/Temp/webbin/*
cp -r SlitherLogic/webbin ~/Documents/Programming/Temp/

git checkout gh-pages
rm -r "$1/*"
cp -r ~/Documents/Programming/Temp/webbin/* "$1/"
git commit -a -m "\"Auto-updated pages $1\""
# git push
git checkout master

echo "done!"
