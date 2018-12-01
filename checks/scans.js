module.exports = async function(log, database, dbName, options, db) {

  const results = await database.collection('system.profile').find({"nscanned":{$gt:1000}})
  if (!results.length) {
    return false;
  }
  log(['check.largeScans', 'info'], { dbName, collection, results });
};
