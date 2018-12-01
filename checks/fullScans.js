module.exports = async function(log, database, dbName, options, db) {

  const results = await database.system.profile.find({"nreturned":{$gt:1}});
  if (!results.length) {
    return false;
  }
  log(['check.fullScans', 'info'], { dbName, collection, results });
};
