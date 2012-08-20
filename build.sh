#!/bin/sh
uglifyjs src/wrench.js > dist/wrench.js
uglifyjs src/wrench.worker.js > dist/wrench.worker.js
cp src/wrench.html dist/wrench.html