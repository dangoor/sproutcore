// ==========================================================================
// Project:   SproutCore Runtime - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

"import package core_test";
var SC = require('index'); // load sproutcore/foundation

var object ;

module("object.registerDependentKeys()", {  
  setup: function() {
    object = SC.Object.create({

        // normal properties
        firstName:  'John',
        lastName:   'Doe',
        observedValue: '',

        // computed property
        fullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ');
        }.property(),

        // init to setup registerDependentKey...
        init: function() {
          sc_super();
          this.registerDependentKey('fullName', 'firstName', 'lastName');
        },

        //observer that should fire whenever the 'fullName' property changes
        fullNameDidChange:  function() {
          this.set('observedValue', this.get('fullName')) ;
        }.observes('fullName')
    });
  }
});


test("should indicate the registered property changes if the dependent key value changes", function() {
  // now, change the firstName...
  object.set('firstName', 'Jane');

  // since fullName is 'dependent' on firstName, then the observer for  
  // 'fullName' should fire here because you changed a dependent key.
  equals(object.get('observedValue'), 'Jane Doe');

  // now change the lastName
  object.set('lastName', 'Johnson');

  // again, fullName is 'dependent' on lastName, so observer for  
  // fullName should fire.
  equals(object.get('observedValue'), 'Jane Johnson');
});


test("should indicate the registered property changes if the dependent key value changes and change is within begin property loop ", function() {
  // Wrap the changes with begin property changes call
  object.beginPropertyChanges();
  
  // now, change the firstName & lastname...
  object.set('firstName', 'Jane');
  object.set('lastName', 'Johnson');
  
  // The observer for fullName should not have fired yet at this  
  // point because we are inside a propertyChange loop.
  equals(object.get('observedValue'), '');
  
  //End the property changes loop.
  object.endPropertyChanges();
  
  // now change the lastName
  object.set('lastName', 'Johnson');

  // again, fullName is 'dependent' on lastName, so observer for  
  // fullName should fire.
  equals(object.get('observedValue'), 'Jane Johnson');
});

plan.run();
