// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
/**
  @class

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/

SC.PersistentStore = SC.Object.extend(
/** @scope SC.PersistentStore.prototype */ {

  /**
    This is a handle to the parent store that you can chain from. Also, if
    you're a base record, you can specify a parent record that is a handle 
    to perisistant storage.

    @property
    @type {SC.PerisistentStore}
  */
  parentStore: null,

  /**
    This is a handle to the in memory child store.ou can chain from. 
    
    @property
    @type {SC.Store}
  */
  childStore: null,

  /**
    Since it is a perisistent store, this is set to YES.

    @property
    @type {Boolean}
  */
  isPersistent: YES,
  
  _createdRecords: [],
  _deletedRecords:[],
  _updatedRecords: [],
  
  // ..........................................................
  // FETCHING
  // 

  /**
    Asks the receiver if it can handle the fetchKey and params by calling 
    canFetch().  If returns YES, sets up an SC.RecordArray and then calls 
    prepareFetch() before returning.  Otherwise, pass along to next store.
    
    @param {Object} fetchKey the fetch key
    @param {Hash} optional additional params
    @param {SC.Store} the store that started the fetch
    @returns {SC.RecordArray} result
  */
  fetch: function(fetchKey, params, store) {
    if (store === undefined) store = this ;
    if (this.canFetch(fetchKey, params, store)) {
      var ret = SC.RecordArray.create({
        store: store,
        fetchKey: fetchKey,
        fetchParams: params,
        delegate: this
      });
      this.prepareFetch(ret) ;
      return ret ;
    } else return sc_super();
  },
  
  /**
    Implement in your subclass to determine if you can handle the passed 
    fetchKey and params.  If you can, return YES and the store will setup a 
    RecordArray for you to populate.
    
    @param {Object} fetchKey the fetch key
    @param {Hash} optional additional params
    @param {SC.Store} the store that started the fetch
    @returns {Boolean} YES if this store can handle it.
  */
  canFetch: function(fetchkey, params, store) {
    return NO ;
  },
  
  /**
    If you return YES to canFetch, then a SC.RecordArray will be setup for
    you and this method will be called so you can prepare the array in any 
    way that you want.  The fetchKey and params can be found on the array 
    as fetchKey and fetchParams.
    
    @param {SC.RecordArray} fetch array.
    @returns {void}
  */
  prepareFetch: function(fetchArray) {
    // do nothing 
  },
    
  ////////////////////////////////////////////////////////////////////////////
  //
  //  Child Store Handling.
  //
  ////////////////////////////////////////////////////////////////////////////
  
  addStore: function(store) {
    this.set('childStore', store);
    store.set('parentStore', this);
  },

  /**
    Given an in memory childStore, handle the changes that have accumulated 
    duringediting, etc. This is called on a parent store by a child store 
    which passes itself in as a parameter.
  
    @param {SC.Store} childStore The child store being committed.
  
    @returns {Boolean} Returns YES if the commit is successful.
  */
  commitChangesFromStore: function(childStore)
  {
    if(childStore === undefined) return NO;

    // Get the childStore's properties.
    var persistentChanges = childStore.persistentChanges;

    this.createdRecords = persistentChanges.created;
    this.deletedRecords = persistentChanges.deleted;
    this.updatedRecords = persistentChanges.updated;
    
    return this.makeChangesPersistent(childStore);
  },
  
  makeChangesPersistent: function(childStore) {
    

    var isSuccess = YES;

    var dataHashes = childStore.dataHashes;
    var storeKeyMap = childStore.storeKeyMap;
    var recKeyTypeMap = childStore.recKeyTypeMap;
    var instantiatedRecordMap = childStore.instantiatedRecordMap;
    var i ;
    
    for(i=0; i<this.createdRecords.length;i++) {
      console.log("AJAX create with hash: "+SC.json.encode(dataHashes[this.createdRecords[i]]));
    }

    for(i=0; i<this.updatedRecords.length;i++) {
      console.log("AJAX update for guid: "+storeKeyMap[this.updatedRecords[i]] + " with hash: "+SC.json.encode(dataHashes[this.updatedRecords[i]]));
    }

    for(i=0; i<this.deletedRecords.length;i++) {
      console.log("AJAX delete for guid: "+storeKeyMap[this.deletedRecords[i]] + " with hash: "+SC.json.encode(dataHashes[this.deletedRecords[i]]));
    }

    return isSuccess;
  },
  
  retrieveRecordForGuid: function(guid, recordType) {
  
    return recordType;
  },
  
  _queries: null,
  
  /**
    Given a filter and a recordType, retrieve matching records. 
    
    @param {SC.Record} recordType The query containing a query.
    @param {String} query The query containing a query.
    @param {Mixed} arguments The arguments for the query.
    
    @returns {Array} Returns an array of matched record instances.
  */
  findAll: function(recordType, queryString)
  {
    if(!queryString) return null;
    
    var args = SC.$A(arguments);
    recordType = args.shift();
    queryString = args.shift();
    
    var query = null;
    if(this._queries[queryString]) 
    {
      query = this._queries[queryString];
    } else {
      this._queries[queryString] = query = SC.Query.create({store: this, delegate: this});
    }
    query.parse(recordType, queryString, args);
    this.prepareQuery(query);
    return query;
  },

  provideLengthForQuery: function(query) {
    if(this.parentStore) {
      this.parentStore.provideLengthForQuery(query);
    } else {
      if(query) {
        query.performQuery();
      }
    }
  },

  prepareQuery: function(query) {
    if(this.parentStore) {
      this.parentStore.prepareQuery(query);
    } else {
      //query.set('hasAllRecords', YES);

      console.log("prep persistent store for query");
    }
  },
  
  provideRecordsForQuery: function(query, range) {
    if(query) {
      query.performQuery();
    }
  },
  
  init: function()
  {
    sc_super();
    this._queries = {};
  }
  
}) ;