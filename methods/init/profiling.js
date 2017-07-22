const async = require('async');

module.exports = {
  method(config, done) {
    const server = this;
    const db = server.mongo.db;

    if (!config.setProfiling) {
      return done();
    }

    async.each(config.databases, (database, next) => {
      db.db(database).command({ profile: 2 }, err => {
        if (err) {
          return next(err);
        }

        server.log(['init.profiling', 'info'], { database, message: 'Profiling set to all' });

        next();
      });
    }, err => {
      done(err);
    });
  }
};
