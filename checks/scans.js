module.exports = async function(log, database, dbName, options, db) {
  const results = await database.collection('system.profile').find({ nscanned: { $gt: 1000 } }).toArray();

  if (!results.length) {
    return false;
  }

  log(['check.largeScans', 'info'], { dbName, results, message: `${results.length} scans found in ${dbName}` });
};
