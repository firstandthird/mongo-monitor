module.exports = async function(log, database, dbName, options, db) {
  const collections = await database.listCollections().toArray();

  Promise.all(collections.map(async collection => {
    const results = await database.collection(collection.name).aggregate([{ $indexStats: { } }]).toArray();

    if (!results.length) {
      return false;
    }

    log(['check.unusedIndexes', 'info'], { dbName, collection, results });
  }));
};
