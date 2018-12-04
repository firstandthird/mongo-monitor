const logrAll = require('logr-all');
const log = logrAll();
const mongodb = require('mongodb');
const reqDir = require('directory-files');

module.exports = async (options) => {
  options.verbose = options.verbose !== false && options.verbose !== 'false';

  // TODO: fill out
  log(['ops', 'info'], {
    slackReportRate: options.slackReportRate,
    logInterval: options.interval,
    verbose: options.verbose,
    name: options.name
  });

  const disabled = options['disable-check'].split(',').map(disable => `checks/${disable}.js`);

  const checkFiles = await reqDir('./checks');
  const checks = [];

  for (const file of checkFiles) {
    if (!disabled.includes(file)) {
      checks.push({ method: require(`../${file}`), file });
    }
  }

  const loop = async function(db) {
    await Promise.all(options.databases.map(async database => {
      const selectedDb = db.db(database);
      log(['info', 'check'], { database, message: `Checking database: ${database}` });
      await Promise.all(checks.map(async check => {
        try {
          await check.method(log, selectedDb, database, options, db);
        } catch (e) {
          log(['check', 'error'], { error: e, check: check.file, message: `Check ${check.file} failed for db ${database}` });
        }
      }));
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
