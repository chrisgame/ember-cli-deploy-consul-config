/* jshint node: true */
'use strict';

var BasePlugin = require('ember-cli-deploy-plugin');
var consul     = require('consul');

var Promise = require('rsvp').Promise;

module.exports = {
  name: 'ember-cli-deploy-consul-config',

  createDeployPlugin: function(options) {
    var Plugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        host: 'localhost',
        port: 8500,
        secure: true,
        token: null
      },

      requiredConfig: ['keys'],

      configure: function() {
        this.log('validating config', { verbose: true });
        var defaultProps = Object.keys(this.defaultConfig || {});
        defaultProps.forEach(this.applyDefaultConfigProperty.bind(this));
        var requiredProps = this.requiredConfig || [];
        requiredProps.forEach(this.ensureConfigPropertySet.bind(this));

        var keysConfig = this.readConfig('keys');
        var keys = Object.keys(keysConfig);

        if (keys.length === 0) {
          var message = 'At least one config key must be defined.';
          this.log(message, { color: 'red' });
          throw new Error(message);
        }

        keys.forEach(function(key) {
          var envVar = keysConfig[key];

          if (process.env[envVar]) {
            var message = '`process.env.' + envVar + '` is already defined. This plugin will overwrite that env var.';
            this.log(message, { color: 'yellow', verbose: true });
          }
        }.bind(this));

        this.log('config ok', { verbose: true });
      },

      setup: function(context) {
        var keys    = this.readConfig('keys');

        var host    = this.readConfig('host');
        var port    = this.readConfig('port');
        var secure  = this.readConfig('secure');
        var token   = this.readConfig('token');

        var options = {
          host: host,
          port: port,
          secure: secure,
          promisify: true,
          defaults: {}
        };

        if (token) {
          options.defaults.token = token;
        }

        var client;

        if (context._consulLib) {
          client = context._consulLib(options).kv;
        } else {
          client = consul(options).kv;
        }

        var promises = Object.keys(keys).map(function(key) {
          return client.get(key)
            .then(function(result) {
              if (result && result['Value']) {
                var envVar = keys[key];

                process.env[envVar] = result['Value'];
              } else {
                var message = 'Key does not exist in Consul: `' + key + '`';

                this.log(message, { color: 'red' });
                return Promise.reject(message);
              }
            }.bind(this));
        }.bind(this));

        return Promise.all(promises);
      }
    });

    return new Plugin();
  }
};
