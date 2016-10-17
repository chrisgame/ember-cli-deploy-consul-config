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
      _consulLib: {
        get: function() {
          return Promise.resolve({ Value: 'bar' });
        }
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
