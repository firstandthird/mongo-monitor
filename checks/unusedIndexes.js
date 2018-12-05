module.exports = async function(log, database, dbName, options, db) {
  let collections = await database.listCollections().toArray();

  collections = collections.filter(collection => collection.name !== 'system.profile');

  Promise.all(collections.map(async collection => {
    let results = await database.collection(collection.name).aggregate([{ $indexStats: { } }]).toArray();

    results = results.filter(result => {
      if (result.name === '_id_') {
        return false;
      }

      if (result.accesses.ops > 0) {
        return false;
      }

      return true;
    });

    if (!results.length) {
      return false;
    }

    log(['check.unusedIndexes', 'info'], { dbName, collection: collection.name, results, message: `Unused indexes found in ${dbName}.${collection.name}` });
  }));
};
