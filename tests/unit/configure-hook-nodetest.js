/* jshint node: true */

var subject = require('../../index');
var assert  = require('../helpers/assert');

describe('Consul Config | configure hook', function() {
  var mockUi;

  beforeEach(function() {
    mockUi = {
      verbose: true,
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  describe('required config', function() {
    it('warns about missing keys', function() {
      var instance = subject.createDeployPlugin({
        name: 'consul-config'
      });

      var context = {
        ui: mockUi,
        config: {
          'consul-config': {}
        }
      };

      instance.beforeHook(context);

      assert.throws(function(){
        instance.configure(context);
      });

      var s = 'Missing required config: \`keys\`';
      assert.match(mockUi.messages.pop(), new RegExp(s));
    });

    it('warns if keys exists but has no properties', function() {
      var instance = subject.createDeployPlugin({
        name: 'consul-config'
      });

      var context = {
        ui: mockUi,
        config: {
          'consul-config': {
            keys: {}
          }
        }
      };

      instance.beforeHook(context);

      assert.throws(function(){
        instance.configure(context);
      });

      var s = 'At least one config key must be defined';
      assert.match(mockUi.messages.pop(), new RegExp(s));
    });

    it('it warns if a specified key is already set on process.env', function() {
      var instance = subject.createDeployPlugin({
        name: 'consul-config'
      });

      process.env.FOO_BAR = 'BAZ';

      var context = {
        ui: mockUi,
        config: {
          'consul-config': {
            keys: {
              foo: 'FOO_BAR'
            }
          }
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      var s = '\`process\.env\.FOO_BAR\` is already defined';
      assert.match(mockUi.messages.splice(-2, 2)[0], new RegExp(s));
    });
  });

  describe('default config', function() {
    var config;

    beforeEach(function() {
      config = {
        keys: { foo: 'bar' },
        host: 'foo',
        port: 1234,
        secure: false,
        token: '1111'
      };
    });

    it('provides default host', function() {
      var instance = subject.createDeployPlugin({
        name: 'consul-config'
      });

      delete config.host;

      var context = {
        ui: mockUi,
        config: {
          'consul-config': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.equal(instance.readConfig('host'), 'localhost');
    });

    it('provides default port', function() {
      var instance = subject.createDeployPlugin({
        name: 'consul-config'
      });

      delete config.port;

      var context = {
        ui: mockUi,
        config: {
          'consul-config': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.equal(instance.readConfig('port'), 8500);
    });

    it('provides default secure', function() {
      var instance = subject.createDeployPlugin({
        name: 'consul-config'
      });

      delete config.secure;

      var context = {
        ui: mockUi,
        config: {
          'consul-config': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.ok(instance.readConfig('secure'));
    });

    it('provides default token', function() {
      var instance = subject.createDeployPlugin({
        name: 'consul-config'
      });

      delete config.token;

      var context = {
        ui: mockUi,
        config: {
          'consul-config': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.isNull(instance.readConfig('token'));
    });
  });
});
