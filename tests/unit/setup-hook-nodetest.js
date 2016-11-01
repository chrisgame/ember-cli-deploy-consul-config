/* jshint node: true */

var subject = require('../../index');
var assert  = require('../helpers/assert');
var Promise = require('ember-cli/lib/ext/promise');

describe('Consul Config | setup hook', function() {
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

  it('constructs the client with the correct options', function() {
    var instance = subject.createDeployPlugin({
      name: 'consul-config'
    });

    var options;
    var mockConsul = function(opts) {
      options = opts;

      return {
        kv: {
          get: function() {
            return Promise.resolve({ Value: 'bar' });
          }
        }
      };
    };

    var context = {
      ui: mockUi,
      config: {
        'consul-config': {
          host: 'foo',
          port: 999,
          secure: false,
          token: 'bar',
          keys: {
            'frontend/config/foo': 'FOO_BAR'
          }
        }
      },
      _consulLib: mockConsul
    };

    instance.beforeHook(context);
    instance.configure(context);

    return assert.isFulfilled(instance.setup(context))
      .then(function() {
        assert.equal(options.host, 'foo');
        assert.equal(options.port, 999);
        assert.notOk(options.secure);
        assert.ok(options.promisify);
        assert.deepEqual(options.defaults, { token: 'bar' });
      });
  });

  it('sets config values on process.env', function() {
    var instance = subject.createDeployPlugin({
      name: 'consul-config'
    });

    var context = {
      ui: mockUi,
      config: {
        'consul-config': {
          keys: {
            'frontend/config/foo': 'FOO_BAR'
          }
        }
      },
      _consulLib: function() {
        return {
          kv: {
            get: function() {
              return Promise.resolve({ Value: 'bar' });
            }
          }
        };
      }
    };

    instance.beforeHook(context);
    instance.configure(context);

    return assert.isFulfilled(instance.setup(context))
      .then(function() {
        assert.equal(process.env.FOO_BAR, 'bar');
      });
  });
});
