#!/bin/bash

GREEN='\033[1;32m'
RED='\033[0;31m'
NC='\033[0m'

NAME='test'
F=0

echo -e "Current pwd: ${GREEN}${pwd}"

function test-init {
  NAME=$1
  waffer init test-project > /dev/null
  cd test-project
}

function compare {
  cd ..
  L=$(diff -r test-project/$1 $2 | wc -l)

  if [[ $L -eq 0 ]] ; then
    echo -e "[${GREEN}OK${NC}] ${NAME}"
  else
    echo -e "[${RED}FAIL${NC}] ${NAME}"
    diff -r test-project/$1 $2
    ((F=F+1))
  fi
  cd test-project
}

function test-cleanup {
  cd ..
  rm -rf test-project
}

test-init export
waffer export > /dev/null
compare html export-0
test-cleanup

test-init new-view
waffer view my-view > /dev/null
waffer export > /dev/null
compare html export-1
test-cleanup

if [[ F -gt 0 ]]; then
  echo -e "${F} tests ${RED}failed${NC}."
  exit 1
else
  echo -e "All tests ${GREEN}succeeded${NC}."
fi
