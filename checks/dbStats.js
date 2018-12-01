module.exports = async function(log, database, dbName, options, db) {
  const stats = await database.stats();

  if (!stats) {
    throw new Error(`No stats returned for ${dbName}`);
  }

  if (options['dbstats-collections'] > -1 && stats.collections > options['dbstats-collections']) {
    log(['check.dbStats', 'warning'], `${dbName} collection count over threshold`);
  }

  if (options['dbstats-views'] > -1 && stats.views > options['dbstats-views']) {
    log(['check.dbStats', 'warning'], `${dbName} views count over threshold`);
  }

  if (options['dbstats-objects'] > -1 && stats.objects > options['dbstats-objects']) {
    log(['check.dbStats', 'warning'], `${dbName} objects count over threshold`);
  }

  if (options['dbstats-avg-obj-size'] > -1 && stats.avgObjSize > options['dbstats-avg-obj-size']) {
    log(['check.dbStats', 'warning'], `${dbName} average object size over threshold`);
  }

  if (options['dbstats-data-size'] > -1 && stats.dataSize > options['dbstats-data-size']) {
    log(['check.dbStats', 'warning'], `${dbName} data size over threshold`);
  }

  if (options['dbstats-storage-size'] > -1 && stats.storageSize > options['dbstats-storage-size']) {
    log(['check.dbStats', 'warning'], `${dbName} storage size over threshold`);
  }

  if (options['dbstats-num-extents'] > -1 && stats.numExtents > options['dbstats-num-extents']) {
    log(['check.dbStats', 'warning'], `${dbName} number of extents over threshold`);
  }

  if (options['dbstats-indexes'] > -1 && stats.indexes < options['dbstats-indexes']) {
    log(['check.dbStats', 'warning'], `${dbName} index count under threshold`);
  }

  if (options['dbstats-index-size'] > -1 && stats.indexSize > options['dbstats-index-size']) {
    log(['check.dbStats', 'warning'], `${dbName} index size over threshold`);
  }
};
