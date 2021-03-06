/**
 * Nested Records (SC.ChildRecord) Unit Test
 *
 * @author Evin Grano
 */

// ..........................................................
// Basic Set up needs to move to the setup and teardown
// 
var NestedRecord, store, testParent, childData1; 

var initModels = function(){
  NestedRecord.ParentRecordTest = SC.Record.extend({
    /** Child Record Namespace */
    childRecordNamespace: NestedRecord,

    name: SC.Record.attr(String),
    info: SC.Record.toOne('NestedRecord.ChildRecordTest', { nested: true })
  });

  NestedRecord.ChildRecordTest = SC.ChildRecord.extend({
    id: SC.Record.attr(String),
    name: SC.Record.attr(String),
    value: SC.Record.attr(String)
  });
};

// ..........................................................
// Basic SC.Record Stuff
// 
module("Basic SC.Record Functions w/ Parent > Child", {

  setup: function() {
    NestedRecord = SC.Object.create({
      store: SC.Store.create()
    });
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    testParent = store.createRecord(NestedRecord.ParentRecordTest, {
      name: 'Parent Name',
      info: {
        type: 'ChildRecordTest',
        name: 'Child Name',
        value: 'Blue Goo',
        id: '5001'
      }
    });
    SC.RunLoop.end();
    // ..........................................................
    // Child Data
    // 
    childData1 = {
      type: 'ChildRecordTest',
      name: 'Child Name',
      value: 'Green Goo',
      id: '5002'
    };
  },

  teardown: function() {
    delete NestedRecord.ParentRecordTest;
    delete NestedRecord.ChildRecordTest;
    testParent = null;
    store = null;
    childData1 = null;
    NestedRecord = null;
  }
});

test("Function: readAttribute()", function() {
  equals(testParent.readAttribute('name'), 'Parent Name', "readAttribute should be correct for name attribute");
  
  equals(testParent.readAttribute('nothing'), null, "readAttribute should be correct for invalid key");
  
  same(testParent.readAttribute('info'),   
    {
      type: 'ChildRecordTest',
      name: 'Child Name',
      value: 'Blue Goo',
      id: '5001'
    },
    "readAttribute should be correct for info child attribute");
  
});

test("Function: writeAttribute()", function() {
  
  testParent.writeAttribute('name', 'New Parent Name');
  equals(testParent.get('name'), 'New Parent Name', "writeAttribute should be the new name attribute");
  
  testParent.writeAttribute('nothing', 'nothing');
  equals(testParent.get('nothing'), 'nothing', "writeAttribute should be correct for new key");
  
  testParent.writeAttribute('info', {
    type: 'ChildRecordTest',
    name: 'New Child Name',
    value: 'Red Goo'
  });
  same(testParent.readAttribute('info'),   
    {
      type: 'ChildRecordTest',
      name: 'New Child Name',
      value: 'Red Goo'
    },
    "writeAttribute with readAttribute should be correct for info child attribute");
});

test("Basic Read", function() {
  var id;
  // Test general gets
  equals(testParent.get('name'), 'Parent Name', "get should be correct for name attribute");
  equals(testParent.get('nothing'), null, "get should be correct for invalid key");
  
  // Test Child Record creation
  var cr = testParent.get('info');
  // Check Model Class information
  ok(SC.kindOf(cr, SC.ChildRecord), "get() creates an actual instance that is a kind of a SC.ChildRecord Object");
  ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest), "get() creates an actual instance of a ChildRecordTest Object");
  
  // Check reference information
  var pm = cr.get('primaryKey');
  var key = cr.get(pm);
  var storeRef = store.find(NestedRecord.ChildRecordTest, key);
  ok(storeRef, 'checking that the store has the instance of the child record with proper primary key');
  equals(cr, storeRef, "checking the parent reference is the same as the direct store reference");
  
  // Check to see if the attributes of a Child Record match the refrence of the parent
  same(storeRef.get('attributes'), testParent.readAttribute('info'), "check that the ChildRecord's attributes are the same as the ParentRecord's readAttribute for the reference");
  
  // Duplication check
  var sameCR = testParent.get('info');
  ok(sameCR, "check to see if we have an instance of a child record again");
  var oldKey = cr.get(pm), newKey = sameCR.get(pm);
  equals(oldKey, newKey, "check to see if the Primary Key are the same");
  same(sameCR, cr, "check to see that it is the same child record as before");
  
  // ID check
  id = sameCR.get('id');
  ok((id !== oldKey), "if there is an id param, it should be different from the Primary Key: %@ != %@".fmt(id, oldKey));
});

test("Basic Write", function() {
  
  // Test general gets
  testParent.set('name', 'New Parent Name');
  equals(testParent.get('name'), 'New Parent Name', "set() should change name attribute");
  testParent.set('nothing', 'nothing');
  equals(testParent.get('nothing'), 'nothing', "set should change non-existent property to a new property");
  
  // Test Child Record creation
  var oldCR = testParent.get('info');
  testParent.set('info', {
    type: 'ChildRecordTest',
    name: 'New Child Name',
    value: 'Red Goo'
  });
  var cr = testParent.get('info');
  // Check Model Class information
  ok(SC.kindOf(cr, SC.ChildRecord), "set() with an object creates an actual instance that is a kind of a SC.ChildRecord Object");
  ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest), "set() with an object creates an actual instance of a ChildRecordTest Object");
  
  // Check reference information
  var pm = cr.get('primaryKey');
  var key = cr.get(pm);
  var storeRef = store.find(NestedRecord.ChildRecordTest, key);
  ok(storeRef, 'after a set() with an object, checking that the store has the instance of the child record with proper primary key');
  equals(cr, storeRef, "after a set with an object, checking the parent reference is the same as the direct store reference");
  var oldKey = oldCR.get(pm);
  ok(!(oldKey === key), 'check to see that the old child record has a different key from the new child record');
  
  // Check for changes on the child bubble to the parent.
  cr.set('name', 'Child Name Change');
  equals(cr.get('name'), 'Child Name Change', "after a set('name', <new>) on child, checking that the value is updated");
  ok(cr.get('status') & SC.Record.DIRTY, 'check that the child record is dirty');
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');
  var newCR = testParent.get('info');
  same(newCR, cr, "after a set('name', <new>) on child, checking to see that the parent has recieved the changes from the child record");
  same(testParent.readAttribute('info'), cr.get('attributes'), "after a set('name', <new>) on child, readAttribute on the parent should be correct for info child attributes");
});

test("Child Status Changed", function() {
  var cr;
  cr = testParent.get('info');
  equals(cr.get('status'), testParent.get('status'), 'after initializing the parent to READY_NEW, check that the child record matches');
  
  SC.RunLoop.begin();
  store.writeStatus(testParent.storeKey, SC.Record.DIRTY_NEW);
  store.dataHashDidChange(testParent.storeKey);
  equals(cr.get('status'), testParent.get('status'), 'after setting the parent to DIRTY_NEW, check that the child record matches');
  SC.RunLoop.end();
  
  SC.RunLoop.begin();
  store.writeStatus(testParent.storeKey, SC.Record.BUSY_REFRESH);
  store.dataHashDidChange(testParent.storeKey);
  equals(cr.get('status'), testParent.get('status'), 'after setting the parent to BUSY_REFRESH, check that the child record matches');
  SC.RunLoop.end();
});
