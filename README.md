# ember-cli-deploy-consul-config

> An EmberCLI Deploy plugin to retrieve config from Consul and add it to
> process.env for use by other plugins' config

This plugin pulls the specified keys from Consul and puts the values on
`process.env` so that they can be referenced in `config/deploy.js` by other
plugin's configs.

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy
pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline
hooks.

For more information on what plugins are and how they work, please refer to the
[Plugin Documentation][1].

## Quick Start
To get up and running quickly, do the following:

- Install this plugin

```bash
$ ember install ember-cli-deploy-consul-config
```

- Place the following configuration into `config/deploy.js`

```javascript
ENV['consul-config'] = {
  host: '<consul-host>',
  port: <consul-port>,
  keys: {
    'config/aws-access-token': 'AWS_ACCESS_TOKEN'
  }
}
```

- Acess the config property in `config/deploy.js`

```javascript
ENV.s3 = {
  awsAccessToken: process.AWS_ACCESS_TOKEN
}
```

- Run the pipeline

```bash
$ ember deploy production
```

## Why would I use this plugin?

You would use this plugin if you want to store configuration values in Consul's
KV store, instead of as environment variables on the machine that is running
ember-cli-deploy.

## Installation
Run the following command in your terminal:

```bash
ember install ember-cli-deploy-consul-config
```

## ember-cli-deploy hooks implemented

For detailed information on what plugin hooks are and how they work, please
refer to the [Plugin Documentation][1].

- `configure`
- `setup`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to
the [Plugin Documentation][1].

### host

The Consul host.

*Default:* `'localhost'`

### port

The Consul port.

*Default:* `8500`

### secure

Whether or not to enable HTTPS.

*Default:* `true`

### keys (required)

An object containing properties that map the keys on Consul to the `process.env`
property you'd like to access the config value with. For example, the following
config:

```javascript
// config/deploy.js

ENV['consul-config'] = {
  keys: {
    'config/aws-access-token': 'AWS_ACCESS_TOKEN'
  }
};
```

would make the the config value available at `process.env.AWS_ACCESS_TOKEN`.

## Prerequisites

This plugin has no prerequisites.

## Running tests

```bash
$ npm test
```

<p align="center"><sub>Made with :heart: by The Kayako Engineering Team</sub></p>

[1]: http://ember-cli-deploy.com/plugins "Plugin Documentation"
