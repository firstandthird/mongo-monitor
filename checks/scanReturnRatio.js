module.exports = async function (log, database, dbName, options, db) {
  const status = await database.runCommand({ serverStatus: 1 });

  if (!status || !status.metrics) {
    throw new Error(`No status returned for ${dbName}`);
  }

  const ratio = ((status.metrics.queryExecutor.scanedObjects || 1) / (status.metrics.document.returned || 1));

  if (options['scanned-returned-ratio'] > -1 && ratio > options['scanned-returned-ratio']) {
    log(['check.scanned-returned', 'warning'], `${dbName} scanned / returned is ${ratio}`);
  }
};
