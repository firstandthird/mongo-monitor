const async = require('async');

module.exports = {
  method(done) {
    const server = this;
    const config = server.settings.app;
    const db = server.mongo.db;

    async.eachLimit(config.databases, 2, (database, next) => {
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

            server.log(['check.unusedIndexes', 'info'], { database, collection, results });

            cb();
          });
        }, next);
      });
    }, err => {
      if (err) {
        return done(err);
      }
    });
  }
};
