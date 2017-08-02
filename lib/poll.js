const mongodb = require('mongodb');
const Logr = require('logr');
const logrFlat = require('logr-flat');
const logrSlack = require('logr-slack');
const async = require('async');

let log;

const unindexedQueries = (options, db) => {
  async.eachLimit(options.databases, 2, (database, next) => {
    const currentdb = db.db(database);
    currentdb.collection('system.profile').find({
      ns: {
        $ne: `${database}.system.profile`
      },
      planSummary: 'COLLSCAN',
      ts: {
        $gt: new Date(Date.now() - 1000 * options.interval)
      },
      millis: {
        $gte: options['unindexed-time-spent']
      }
    }).toArray((err, results) => {
      results.forEach(result => {
        log(['check.collscan', 'warning'], {
          database,
          collection: result.ns,
          query: result.query,
          timeSpent: result.millis
        });
      });
      next(err);
    });
  }, err => {
    if (err) {
      return log(['mongo', 'error'], err);
    }
  });
};

const unusedIndexes = (options, db) => {
  async.eachLimit(options.databases, 2, (database, next) => {
    const currentdb = db.db(database);

    currentdb.listCollections().toArray((err, collections) => {
      if (err) {
        return next(err);
      }

      async.eachLimit(collections, 2, (collection, cb) => {
        db.collection(collection.name).aggregate([{ $indexStats: { } }]).toArray((err2, results) => {
          if (err2) {
            return cb(err2);
          }

          if (!results.length) {
            return cb();
          }

          log(['check.unusedIndexes', 'info'], { database, collection, results });

          cb();
        });
      }, next);
    });
  }, err => {
    if (err) {
      return log(['mongo', 'error'], err);
    }
  });
};

const dbStats = (options, db) => {
  async.eachLimit(options.databases, 2, (database, next) => {
    const currentdb = db.db(database);

    currentdb.stats((err, stats) => {
      if (err) {
        return next(err);
      }

      if (!stats) {
        return next(new Error(`No stats returned for ${database}`));
      }

      if (options['dbstats-collections'] > -1 && stats.collections > options['dbstats-collections']) {
        log(['check.dbStats', 'warning'], `${database} collection count over threshold`);
      }

      if (options['dbstats-views'] > -1 && stats.views > options['dbstats-views']) {
        log(['check.dbStats', 'warning'], `${database} views count over threshold`);
      }

      if (options['dbstats-objects'] > -1 && stats.objects > options['dbstats-objects']) {
        log(['check.dbStats', 'warning'], `${database} objects count over threshold`);
      }

      if (options['dbstats-avg-obj-size'] > -1 && stats.avgObjSize > options['dbstats-avg-obj-size']) {
        log(['check.dbStats', 'warning'], `${database} average object size over threshold`);
      }

      if (options['dbstats-data-size'] > -1 && stats.dataSize > options['dbstats-data-size']) {
        log(['check.dbStats', 'warning'], `${database} data size over threshold`);
      }

      if (options['dbstats-storage-size'] > -1 && stats.storageSize > options['dbstats-storage-size']) {
        log(['check.dbStats', 'warning'], `${database} storage size over threshold`);
      }

      if (options['dbstats-num-extents'] > -1 && stats.numExtents > options['dbstats-num-extents']) {
        log(['check.dbStats', 'warning'], `${database} number of extents over threshold`);
      }

      if (options['dbstats-indexes'] > -1 && stats.indexes < options['dbstats-indexes']) {
        log(['check.dbStats', 'warning'], `${database} index count under threshold`);
      }

      if (options['dbstats-indexe-size'] > -1 && stats.indexSize > options['dbstats-indexe-size']) {
        log(['check.dbStats', 'warning'], `${database} index size over threshold`);
      }

      next();
    });
  }, err => {
    if (err) {
      return log(['mongo', 'error'], err);
    }
  });
};

module.exports = (options) => {
  options.verbose = options.verbose !== false && options.verbose !== 'false';

  const reporters = {
    flat: {
      reporter: logrFlat,
      options: {
        timestamp: false,
        appColor: true
      }
    }
  };
  if (options.slackHook) {
    reporters.slack = {
      reporter: logrSlack,
      options: {
        slackHook: options.slackHook,
        filter: ['warning', 'restored'],
        username: 'Ops',
        hideTags: true,
        tagColors: {
          warning: 'warning',
          restored: 'good'
        },
        throttle: options.slackReportRate * 1000,
        throttleBasedOnTags: true,
      }
    };
  }
  const logObj = Logr.createLogger({ reporters });
  log = (tags, message) => {
    if (typeof message === 'string' && options.name) {
      message = `${message} on ${options.name}`;
    }
    logObj(tags, message);
  };

  // TODO: fill out
  log(['ops', 'info'], {
    slackReportRate: options.slackReportRate,
    logInterval: options.interval,
    verbose: options.verbose,
    name: options.name
  });
  const runTimer = (db) => {
    setTimeout(() => {
      unindexedQueries(options, db);
      unusedIndexes(options, db);
      dbStats(options, db);
      runTimer(db);
    }, options.interval * 1000);
  };

  mongodb.MongoClient.connect(options.mongo, (err, db) => {
    if (err) {
      return log(['mongo', 'error'], err);
    }

    if (!options['set-profiling']) {
      return runTimer(db);
    }

    async.each(options.databases, (database, next) => {
      db.db(database).command({ profile: 2 }, err2 => {
        if (err2) {
          return next(err2);
        }

        log(['init.profiling', 'info'], { database, message: 'Profiling set to all' });

        next();
      });
    }, err2 => {
      if (err2) {
        return log(['mongo', 'error'], err2);
      }

      runTimer(db);
    });
  });
};
