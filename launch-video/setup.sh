#!/bin/sh
# Stamps this clone's absolute path into src/repo.js, which the composition
# imports to resolve its media assets (dapi resolves media `src` against the
# OS, so the paths must be absolute). Run once after cloning, from anywhere.
set -e
cd "$(dirname "$0")"
printf 'export const REPO = %s;\n' "$(pwd | sed 's/["\\]/\\&/g; s/^/"/; s/$/"/')" > src/repo.js
echo "Wrote src/repo.js — assets resolve from $(pwd)"
