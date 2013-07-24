# -*- encoding: utf-8 -*-
require './lib/ember/data/version'

Gem::Specification.new do |gem|
  gem.name          = "ember-data-source"
  gem.authors       = ["Yehuda Katz"]
  gem.email         = ["wycats@gmail.com"]
  gem.date          = Time.now.strftime("%Y-%m-%d")
  gem.summary       = %q{ember-data source code wrapper.}
  gem.description   = %q{ember-data source code wrapper for use with Ruby libs.}
  gem.homepage      = "https://github.com/emberjs/data"
  gem.version       = Ember::Data::VERSION

  gem.add_dependency "ember-source"

  gem.files = %w(VERSION) + Dir['dist/ember-data*.js', 'lib/ember/data/*.rb']
end