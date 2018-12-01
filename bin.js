#! /usr/bin/env node
const poll = require('./lib/poll.js');
const argv = require('yargs')
  .help('h')
  .alias('h', 'help')
  .option('mongo', {
    alias: 'm',
    describe: 'mongo connection url',
    default: 'mongodb://localhost',
    demandOption: true,
  })
  .option('verbose', {
    describe: 'verbose mode',
    default: false
  })
  .option('interval', {
    alias: 'i',
    describe: 'polling interval expressed in seconds',
    default: 60 * 10
  })
  .option('set-profiling', {
    alias: 'p',
    describe: 'automatically enable profiling on all databases',
    default: false,
    boolean: true
  })
  .option('unindexed-time-spent', {
    describe: 'threshold for time spent on unindexed queries',
    default: 0
  })
  .option('dbstats-collections', {
    describe: 'threshold for the minimum number of collections that should exist',
    default: -1
  })
  .option('dbstats-views', {
    describe: 'threshold for views',
    default: -1
  })
  .option('dbstats-objects', {
    describe: 'threshold for objects',
    default: -1
  })
  .option('dbstats-avg-obj-size', {
    describe: 'threshold for average object size (in bytes)',
    default: -1
  })
  .option('dbstats-data-size', {
    describe: 'threshold for data size (in bytes)',
    default: -1
  })
  .option('dbstats-storage-size', {
    describe: 'threshold for storage size (in bytes)',
    default: -1
  })
  .option('dbstats-num-extents', {
    describe: 'threshold for numExtents',
    default: -1
  })
  .option('dbstats-indexes', {
    describe: 'threshold for the minimum number of indexes',
    default: -1
  })
  .option('dbstats-index-size', {
    describe: 'threshold for index size (in bytes)',
    default: -1
  })
  .option('databases', {
    alias: 'db',
    describe: 'name of database to use',
    default: undefined,
    demandOption: true
  })
  .option('name', {
    alias: 'n',
    describe: 'optional server name when posting messages',
    default: undefined
  })
  .env('MONGO_MONITOR')
  .argv;

argv.databases = argv.databases.split(',');
poll(argv);
