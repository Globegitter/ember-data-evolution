var get = Ember.get, set = Ember.set;
var store, container, Person, Phone, App;

module("DS.FixtureAdapter", {
  setup: function() {
    store = DS.Store.create({
      adapter: 'fixture'
    });

    container = new Ember.Container();
    container.register('adapter:fixture', DS.FixtureAdapter);
    store.container = container;

    Person = DS.Model.extend({
      firstName: DS.attr('string'),
      lastName: DS.attr('string'),

      height: DS.attr('number'),

      phones: DS.hasMany('App.Phone')
    });

    Phone = DS.Model.extend({
      person: DS.belongsTo('App.Person')
    });

    App = Ember.Namespace.create();
    App.Person = Person;
    App.Phone = Phone;
    Ember.lookup.App = App;

    // Enable setTimeout.
    Ember.testing = false;

    Person.FIXTURES = [];
    Phone.FIXTURES = [];
  },
  teardown: function() {
    Ember.testing = true;

    Ember.run(function() {
      store.destroy();
      App.destroy();
      container.destroy();
    });
    store = null;
    Person = null;
    Phone = null;
  }
});

test("should load data for a type asynchronously when it is requested", function() {
  Person.FIXTURES = [{
    id: 'wycats',
    firstName: "Yehuda",
    lastName: "Katz",

    height: 65
  },

  {
    id: 'ebryn',
    firstName: "Erik",
    lastName: "Brynjolffsosysdfon",

    height: 70,
    phones: [1, 2]
  }];

  Phone.FIXTURES = [{
    id: 1,
    person: 'ebryn'
  }, {
    id: 2,
    person: 'ebryn'
  }];

  stop();

  var ebryn = store.find(Person, 'ebryn');

  equal(get(ebryn, 'isLoaded'), false, "record from fixtures is returned in the loading state");

  store.promiseFor(ebryn).then(function() {
    clearTimeout(timer);
    start();

    ok(get(ebryn, 'isLoaded'), "data loads asynchronously");
    equal(get(ebryn, 'height'), 70, "data from fixtures is loaded correctly");
    equal(get(ebryn, 'phones.length'), 2, "relationships from fixtures is loaded correctly");

    stop();

    var wycats = store.find(Person, 'wycats');
    store.promiseFor(wycats).then(function() {
      clearTimeout(timer);
      start();

      equal(get(wycats, 'isLoaded'), true, "subsequent requests for records are returned asynchronously");
      equal(get(wycats, 'height'), 65, "subsequent requested records contain correct information");
    });

    timer = setTimeout(function() {
      start();
      ok(false, "timeout exceeded waiting for fixture data");
    }, 1000);
  });

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should load data asynchronously at the end of the runloop when simulateRemoteResponse is false", function() {
  Person.FIXTURES = [{
    id: 'wycats',
    firstName: "Yehuda"
  }];

  store = DS.Store.create({
    adapter: DS.FixtureAdapter.create({
      simulateRemoteResponse: false
    })
  });

  var wycats;

  Ember.run(function() {
    wycats = store.find(Person, 'wycats');
    ok(!get(wycats, 'isLoaded'), 'isLoaded is false initially');
    ok(!get(wycats, 'firstName'), 'record properties are undefined initially');
  });

  ok(get(wycats, 'isLoaded'), 'isLoaded is true after runloop finishes');
  equal(get(wycats, 'firstName'), 'Yehuda', 'record properties are defined after runloop finishes');
});

test("should create record asynchronously when it is committed", function() {
  stop();

  equal(Person.FIXTURES.length, 0, "Fixtures is empty");

  var paul = store.createRecord(Person, {firstName: 'Paul', lastName: 'Chavard', height: 70});

  paul.on('didCreate', function() {
    clearTimeout(timer);
    start();

    equal(get(paul, 'isNew'), false, "data loads asynchronously");
    equal(get(paul, 'isDirty'), false, "data loads asynchronously");
    equal(get(paul, 'height'), 70, "data from fixtures is saved correctly");

    equal(Person.FIXTURES.length, 1, "Record added to FIXTURES");

    var fixture = Person.FIXTURES[0];

    equal(fixture.id, Ember.guidFor(paul));
    equal(fixture.firstName, 'Paul');
    equal(fixture.lastName, 'Chavard');
    equal(fixture.height, 70);
  });

  store.commit();

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should update record asynchronously when it is committed", function() {
  stop();

  equal(Person.FIXTURES.length, 0, "Fixtures is empty");

  var paul = store.recordForReference(store.load(Person, 1, {firstName: 'Paul', lastName: 'Chavard', height: 70}));

  paul.set('height', 80);

  paul.on('didUpdate', function() {
    clearTimeout(timer);
    start();

    equal(get(paul, 'isDirty'), false, "data loads asynchronously");
    equal(get(paul, 'height'), 80, "data from fixtures is saved correctly");

    equal(Person.FIXTURES.length, 1, "Record FIXTURES updated");

    var fixture = Person.FIXTURES[0];

    equal(fixture.firstName, 'Paul');
    equal(fixture.lastName, 'Chavard');
    equal(fixture.height, 80);
  });

  store.commit();

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should delete record asynchronously when it is committed", function() {
  stop();

  equal(Person.FIXTURES.length, 0, "Fixtures empty");

  var paul = store.recordForReference(store.load(Person, 1, {firstName: 'Paul', lastName: 'Chavard', height: 70}));

  paul.deleteRecord();

  paul.on('didDelete', function() {
    clearTimeout(timer);
    start();

    equal(get(paul, 'isDeleted'), true, "data deleted asynchronously");
    equal(get(paul, 'isDirty'), false, "data deleted asynchronously");

    equal(Person.FIXTURES.length, 0, "Record removed from FIXTURES");
  });

  store.commit();

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should follow isUpdating semantics", function() {
  stop();

  Person.FIXTURES = [{
    id: "twinturbo",
    firstName: "Adam",
    lastName: "Hawkins",
    height: 65
  }];

  var result = store.find(Person);

  result.addObserver('isUpdating', function() {
    clearTimeout(timer);
    start();
    clearTimeout(timer);
    equal(get(result, 'isUpdating'), false, "isUpdating is set when it shouldn't be");
  });

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should coerce integer ids into string", function() {
  stop();

  Person.FIXTURES = [{
    id: 1,
    firstName: "Adam",
    lastName: "Hawkins",
    height: 65
  }];

  var result = store.find(Person, "1");

  store.promiseFor(result).then(function() {
    clearTimeout(timer);
    start();
    clearTimeout(timer);
    strictEqual(get(result, 'id'), "1", "should load integer model id as string");
  });

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should coerce belongsTo ids into string", function() {
  stop();

  Person.FIXTURES = [{
    id: 1,
    firstName: "Adam",
    lastName: "Hawkins",

    phones: [1]
  }];
  Phone.FIXTURES = [{
    id: 1,
    person: 1
  }];

  var result = store.find(Phone, "1");

  store.promiseFor(result).then(function() {
    var person = get(result, 'person');
    person.on('didLoad', function() {
      clearTimeout(timer);
      start();
      strictEqual(get(result, 'person.id'), "1", "should load integer belongsTo id as string");
      strictEqual(get(result, 'person.firstName'), "Adam", "resolved relationship with an integer belongsTo id");
    });
  });

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("only coerce belongsTo ids to string if id is defined and not null", function() {
  stop();

  Person.FIXTURES = [];

  Phone.FIXTURES = [{
    id: 1
  }];

  store.fetch(Phone, 1).then(function(phone) {
    clearTimeout(timer);
    start();
    equal(phone.get('person'), null);
  });

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should throw if ids are not defined in the FIXTURES", function() {
  Person.FIXTURES = [{
    firstName: "Adam",
    lastName: "Hawkins",
    height: 65
  }];

  raises(function(){
    store.find(Person, "1");
  }, /the id property must be defined as a number or string for fixture/);

  Person.FIXTURES = [{
    id: 0
  }];
  stop();
  try {
    // should accept 0 as an id, all is fine
    store.fetch(Person, "0").then(function() {
      clearTimeout(timer);
      start();
    });
    var timer = setTimeout(function() {
      start();
      ok(false, "timeout exceeded waiting for fixture data");
    }, 1000);
  } catch (err) {
    ok(false, "model with id of zero raises undefined id error");
    start();
  }
});
