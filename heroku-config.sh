#!/bin/sh
heroku config:set NODE_ENV=heroku
heroku config:set LAMBDA_CONFIG=`jq -c . lambda.json`
