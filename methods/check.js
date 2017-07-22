const async = require('async');

module.exports = {
  method(done) {
    const server = this;
    const config = server.settings.app;

    async.autoInject({
      unindexedQueries(next) {
        if (!config.checks.unindexedQueries) {
          server.log(['check', 'info'], 'unindexedQueries disabled, skipping');
          return next();
        }

        server.methods.checks.unindexedQueries(next);
      },
      unusedIndexes(next) {
        if (!config.checks.unusedIndexes) {
          server.log(['check', 'info'], 'unusedIndexes disabled, skipping');
          return next();
        }

        server.methods.checks.unusedIndexes(next);
      },
      dbStats(next) {
        if (!config.checks.dbStats) {
          server.log(['check', 'info'], 'dbStats disabled, skipping');
          return next();
        }

        server.methods.checks.dbStats(next);
      }
    }, done);
  }
};
