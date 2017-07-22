const async = require('async');

module.exports = {
  method(done) {
    const server = this;
    const config = server.settings.app;
    const db = server.mongo.db;

    async.eachLimit(config.databases, 2, (database, next) => {
      const currentdb = db.db(database);
      currentdb.collection('system.profile').find({
        ns: {
          $ne: `${database}.system.profile`
        },
        planSummary: 'COLLSCAN',
        ts: {
          $gt: new Date(Date.now() - 1000 * config.everySeconds)
        },
        millis: {
          $gte: config.thresholds.unindexedTimeSpent
        }
      }).toArray((err, results) => {
        results.forEach(result => {
          server.log(['check.collscan', 'warning'], {
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
        return done(err);
      }
    });
  }
};
