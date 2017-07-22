const async = require('async');

exports.register = (server, options, next) => {
  const defaultConfig = server.settings.app;
  const args = require('yargs').argv;
  const logPath = process.env.LOG_PATH || args.log;
  const remoteConfig = process.env.CONFIG_URL || args.configUrl;
  let configPath = process.env.CONFIG_PATH || args.config;
  let isRemoteConfig = false;

  if (remoteConfig) {
    configPath = remoteConfig;
    isRemoteConfig = true;
  }

  server.on('start', () => {
    server.log(['healthcheck', 'slack', 'start'], 'Mongo Monitor started');
  });

  async.autoInject({
    config(done) {
      if (!logPath && !configPath) {
        return done(null, defaultConfig);
      }

      server.methods.init.config(configPath, isRemoteConfig, done);
    },
    expose(config, done) {
      server.expose('config', config);
      done();
    },
    slack(expose, config, done) {
      server.methods.init.slack(config.slack, done);
    },
    profiling(config, done) {
      server.methods.init.profiling(config, done);
    }
  }, next);
};

exports.register.attributes = {
  name: 'mongo-monitor'
};
