module.exports = async function(log, database, dbName, options, db) {
  const results = await database.collection('system.profile').find({
    nreturned: { $gt: 1 },
    ts: { $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000))) }
  }).toArray();

  if (!results.length) {
    return false;
  }

  log(['check.fullScans', 'info'], { dbName, results, message: `Full scans found in ${dbName}` });
};
