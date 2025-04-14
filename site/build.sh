#!/bin/bash

mkdir -p dist/about
cp index.html dist/.
find about -name '*.md' -exec sh -c './node_modules/.bin/markdown-it-cli {} -o dist/about/$(basename {} .md).html' \;
exit 0