require 'rubygems'
require 'colorize'

branches = %w(
  did-create-not-firing
  updating-record-array
  adapter-http-request
  transaction-promise
  fetch-and-remove-load-promise
  errors-handler
  default-adapter
  exists
)

branches.each do |branch|
  `git co evolution/#{branch}`
  `git branch -D evolution-merge/#{branch}`
  `git co -b evolution-merge/#{branch}`
  `git rebase setup`
end

def merge_branch(name, merge=true)
  `git co evolution-merge/#{name}`
  `git rebase evolution-merge-master`

  yield if block_given?

  if merge
    `git co evolution-merge-master`
    `git merge evolution-merge/#{name}`
    puts "merged #{name}".colorize(:green)
  end
end

def patch_file(filepath, message)
  content = File.read(filepath)
  content = yield content
  File.write(filepath, content)
  `git add #{filepath}`
  `git commit -m "#{message}"`
end

`git branch -D evolution-merge-master`
`git co setup`
`git co -b evolution-merge-master`

# 1. did-create-not-firing
`git merge evolution-merge/did-create-not-firing`
puts "merged did-create-not-firing".colorize(:green)

# 2. updating-record-array
merge_branch "updating-record-array"

# 3. fetch-and-remove-load-promise
merge_branch "fetch-and-remove-load-promise" do
  # git rerere resolve
  `git add packages/ember-data/lib/system/record_arrays/record_array.js`
  `git rebase --continue`
end

# 4. transaction-promise
merge_branch "transaction-promise"

# 5. adapter-http-request
merge_branch "adapter-http-request" do
  # git rerere resolve
  `git add packages/ember-data/lib/system/adapter.js`
  `git add packages/ember-data/lib/system/store.js`
  `git add tests/ember_configuration.js`
  `git rebase --continue`
end

# 6. errors-handler
merge_branch('errors-handler')

# 7. default-adapter
merge_branch('default-adapter')

# 8. exists
merge_branch "exists"

patch_file 'packages/ember-data/tests/unit/rest_adapter_test.js', "fix rest adapter test" do |content|
  content.gsub('ajaxHash.success({ person: { id: 1, name: "Tom Dale" } });', 'ajaxSuccess({ person: { id: 1, name: "Tom Dale" } });')
end

patch1 = <<PATCH
  resolveWith: function(thenable, recordOrArray) {
    return Ember.RSVP.resolve(thenable).then(function() {
      return recordOrArray;
    }, function(error) {
      recordOrArray.adapterDidError(error);
      return Ember.RSVP.reject(error);
    });
  },
PATCH

patch2 = <<PATCH
  resolveWith: function(thenable, recordOrArray) {
    var store = this;
    return Ember.RSVP.resolve(thenable).then(function() {
      return recordOrArray;
    }, function(error) {
      if (error instanceof DS.ValidationError) {
        store.recordWasInvalid(recordOrArray, error.errors);
      } else {
        store.recordWasError(recordOrArray, error);
      }
      return Ember.RSVP.reject(error);
    });
  },
PATCH

patch_file 'packages/ember-data/lib/system/store.js', "fix resolveWith" do |content|
  content.gsub(patch1, patch2)
end
