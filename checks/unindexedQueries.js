module.exports = async function(log, database, dbName, options, db) {
  const results = await database.collection('system.profile').find({
    ns: {
      $ne: `${dbName}.system.profile`
    },
    planSummary: 'COLLSCAN',
    ts: {
      $gt: new Date(Date.now() - 1000 * options.interval)
    },
    millis: {
      $gte: options['unindexed-time-spent']
    }
  }).toArray();

  results.forEach(result => {
    log(['check.collscan', 'warning'], {
      dbName,
      collection: result.ns,
      query: result.query,
      timeSpent: result.millis
    });
  });
};
