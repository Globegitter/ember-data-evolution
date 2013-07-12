require 'rubygems'
require 'colorize'
require 'date'

`git branch -D master`
`git co evolution-merge-master`
`git co -b master`

`bundle exec rake clean`
`bundle exec rake test`
`bundle exec rake dist`

`git co gh-pages`

`mkdir ./builds` if !File.exists?('./builds')
`cp dist/ember-data.js builds/ember-data-evolution.js`
`cp dist/ember-data.prod.js builds/ember-data-evolution.prod.js`

version = DateTime.now
File.write('VERSION', version)

`git add VERSION`
`git add builds/ember-data-evolution.js`
`git add builds/ember-data-evolution.prod.js`
`git commit -m "update builds #{version}"`

`git push origin gh-pages`

`git co master`
`git push --force origin master`
