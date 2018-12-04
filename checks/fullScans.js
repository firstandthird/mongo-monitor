module.exports = async function(log, database, dbName, options, db) {
  const results = await database.collection('system.profile').find({ nreturned: { $gt: 1 } }).toArray();

  if (!results.length) {
    return false;
  }

  log(['check.fullScans', 'info'], { dbName, results, message: `Full scans found in ${dbName}` });
};
