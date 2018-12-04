module.exports = async function(log, database, dbName, options, db) {
  const results = await database.collection('system.profile').aggregate({
    $group: {
      _id: '$ns',
      count: { $sum: 1 },
      'max response time': { $max: '$millis' },
      'avg response time': { $avg: '$millis' }
    }
  }, {
    $sort: {
      'max response time': -1
    }
  }).toArray();

  results.forEach(result => {
    if (result['max response time'] >= options['slow-threshold']) {
      log(['check.slowQueries', 'warning'], {
        dbName,
        count: result.count,
        maxResponseTime: result['max response time'],
        avgResponseTime: result['avg response time'],
        message: `Slow query in ${dbName}`
      });
    }
  });
};
