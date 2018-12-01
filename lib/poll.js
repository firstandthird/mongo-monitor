const logrAll = require('logr-all');
const log = logrAll();
const mongodb = require('mongodb');

const unindexedQueries = require('../checks/unindexedQueries');
const unusedIndexes = require('../checks/unusedIndexes');
const dbStats = require('../checks/dbStats');
const largeScans = require('../checks/scans');
const fullScans = require('../checks/fullScans');

module.exports = async (options) => {
  options.verbose = options.verbose !== false && options.verbose !== 'false';

  // TODO: fill out
  log(['ops', 'info'], {
    slackReportRate: options.slackReportRate,
    logInterval: options.interval,
    verbose: options.verbose,
    name: options.name
  });

  const loop = async function(db) {
    await Promise.all(options.databases.map(async database => {
      const selectedDb = db.db(database);
      log(['info', 'check'], { database });
      await unindexedQueries(log, selectedDb, database, options, db);
      await unusedIndexes(log, selectedDb, database, options, db);
      await dbStats(log, selectedDb, database, options, db);
      await largeScans(log, selectedDb, database, options, db);
      await fullScans(log, selectedDb, database, options, db);
    }));
  };

  const runTimer = (db) => {
    loop(db);
    setTimeout(() => {
      runTimer(db);
    }, options.interval * 1000);
  };

  const db = await mongodb.MongoClient.connect(options.mongo);

  if (!options['set-profiling']) {
    return runTimer(db);
  }

  await Promise.all(options.databases.map(async database => {
    await db.db(database).command({ profile: 2 });

    log(['init.profiling', 'info'], { database, message: 'Profiling set to all' });
  }));

  runTimer(db);
};
