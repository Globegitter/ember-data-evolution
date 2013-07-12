![Ember Data Warning](docs/images/ember-data-in-progress.png)
## Ember Data Evolution [![Build Status](https://secure.travis-ci.org/tchak/ember-data-evolution.png?branch=master)](http://travis-ci.org/tchak/ember-data-evolution)

Ember Data is a library for loading data from a persistence layer (such as
a JSON API), mapping this data to a set of models within your client application,
updating those models, then saving the changes back to a persistence layer. It 
provides many of the facilities you'd find in server-side ORMs like ActiveRecord, but is
designed specifically for the unique environment of JavaScript in the browser.

Ember Data provides a central Data Store, which can be configured with a range of 
provided Adapters, but two core Adapters are provided: the RESTAdapter and BasicAdapter. 

The RESTAdapter is configured for use by default. You can read more about it in 
the [Guides](http://emberjs.com/guides/models/the-rest-adapter/). It provides a fully
RESTful mechanism for communicating with your persistence layer, and is the preferred
and recommened choice for use with Ember Data.

The BasicAdapter is intended to provide a way for developers who want full control 
over how the persistence layer is communicated with via their own implemented Ajax
hooks

This is definitely alpha-quality. The basics of RESTAdapter work, but there are for
sure edge cases that are not yet handled. Please report any bugs or feature
requests, and pull requests are always welcome. The BasicAdapter is under heavy 
development at present.

#### What is "Ember Data Evolution"?

It is a patch set maintained by me ([@tchak](https://github.com/tchak)). It contains some fixes and some new experimental features.
It is not meant to be a fork. Evolution is regulary synced with the master of Ember Data.
There is no guaranty on the api. All the features are meant to be merged in the main repo at some point.

#### What's new compared to Ember Data?

* Fix `didCreate` not fiering [emberjs/data#1077](https://github.com/emberjs/data/pull/1077)
* Fix `isUpdating` change too early and not fiering `didUpdate` [emberjs/data#1030](https://github.com/emberjs/data/pull/1030)
* Add http response object [emberjs/data#1080](https://github.com/emberjs/data/pull/1080)
* Add `fetch` method that return promises [emberjs/data#1076](https://github.com/emberjs/data/pull/1076)
* Transaction `commit` return a promise [emberjs/data#858](https://github.com/emberjs/data/pull/858)
* Better error handling [emberjs/data#958](https://github.com/emberjs/data/pull/958)

#### Is It Good?

Yes.

#### Is It "Production Ready™"?

It is used in production on [Capitaine Train](http://capitainetrain.com)

#### Getting ember-data-evolution

The latest passing build from the "master" branch is available on [tchak.net/ember-data-evolution](http://tchak.net/ember-data-evolution)
