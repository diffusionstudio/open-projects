#!/bin/sh
# Stamps this clone's absolute path into src/repo.js, which the composition
# imports to locate the images it draws through HTML `<img>` tags (those only
# load from an absolute path). Run once after cloning, from anywhere.
set -e
cd "$(dirname "$0")"
printf 'export const REPO = %s;\n' "$(pwd | sed 's/["\\]/\\&/g; s/^/"/; s/$/"/')" > src/repo.js
echo "Wrote src/repo.js — assets resolve from $(pwd)"
