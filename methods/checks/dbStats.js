const async = require('async');

module.exports = {
  method(done) {
    const server = this;
    const config = server.settings.app;
    const db = server.mongo.db;
    const thresholds = config.thresholds.dbStats;

    async.eachLimit(config.databases, 2, (database, next) => {
      const currentdb = db.db(database);

      currentdb.stats((err, stats) => {
        if (err) {
          return next(err);
        }

        if (!stats) {
          return next(new Error(`No stats returned for ${database}`));
        }

        if (thresholds.collections > -1 && stats.collections > thresholds.collections) {
          server.log(['check.dbStats', 'warning'], `${database} collection count over threshold`);
        }

        if (thresholds.views > -1 && stats.views > thresholds.views) {
          server.log(['check.dbStats', 'warning'], `${database} views count over threshold`);
        }

        if (thresholds.objects > -1 && stats.objects > thresholds.objects) {
          server.log(['check.dbStats', 'warning'], `${database} objects count over threshold`);
        }

        if (thresholds.avgObjSize > -1 && stats.avgObjSize > thresholds.avgObjSize) {
          server.log(['check.dbStats', 'warning'], `${database} average object size over threshold`);
        }

        if (thresholds.dataSize > -1 && stats.dataSize > thresholds.dataSize) {
          server.log(['check.dbStats', 'warning'], `${database} data size over threshold`);
        }

        if (thresholds.storageSize > -1 && stats.storageSize > thresholds.storageSize) {
          server.log(['check.dbStats', 'warning'], `${database} storage size over threshold`);
        }

        if (thresholds.numExtents > -1 && stats.numExtents > thresholds.numExtents) {
          server.log(['check.dbStats', 'warning'], `${database} number of extents over threshold`);
        }

        if (thresholds.indexes > -1 && stats.indexes < thresholds.indexes) {
          server.log(['check.dbStats', 'warning'], `${database} index count under threshold`);
        }

        if (thresholds.indexSize > -1 && stats.indexSize > thresholds.indexSize) {
          server.log(['check.dbStats', 'warning'], `${database} index size over threshold`);
        }

        next();
      });
    }, err => {
      if (err) {
        return done(err);
      }
    });
  }
};
