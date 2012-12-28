#!/bin/bash

source /opt/app/config.txt
source /opt/app/functions.sh

START_IP=0

# Create basho bench configs for each node
for NODE in ${!NODES[@]}; do
  create_bench_config $NODE $START_IP
  START_IP=$((START_IP + $NUM_OPERATIONS))
done

ROW=1
COLUMN=1

for NODE in ${!NODES[@]}; do
  JSON="$JSON \n    \"$NODE\":{\n      source: statsSourceUrl(\"${NODE}_*.test.throughput\", {\"from\": \"-2minutes\"}),\n      refresh_interval: 2000,\n      TimeSeries:{\n        parent: \"#g${ROW}-${COLUMN}\",\n        title: \"${NODE}\"\n      }\n    },"

  COLUMN=$((COLUMN + 1))
  if [ $COLUMN -eq 4 ]; then
    ROW=$((ROW + 1))
    COLUMN=1
  fi
done

cp /opt/demo/js/index.js.template /opt/demo/js/index-test.js
sed -i "s/%NODE_CONFIG%/$JSON/g" /opt/demo/js/index-test.js

