(function(){
    var root = this;
    var Hyperadmin;
    if (typeof exports !== 'undefined') {
      Hyperadmin = exports;
    } else {
      Hyperadmin = root.Hyperadmin = {};
    }

    
    Hyperadmin.VERSION = '0.0.1';
    Hyperadmin.CONTENT_TYPE = 'application/vnd.Collection.hyperadmin.backboneclient+JSON';
    Hyperadmin.ACCEPT = Hyperadmin.CONTENT_TYPE ;

    Hyperadmin.sync = function(method, model, options) {
        if (!options) {options = {};}
        options.contentType = Hyperadmin.CONTENT_TYPE;
        options.accepts = {"json":Hyperadmin.ACCEPT};
        
        if (!options.data && model && (method == 'create' || method == 'update')) {
          options.data = JSON.stringify(model.toJSON());
        }
        
        return Backbone.sync(method, model, options);
    };
    
    Hyperadmin.Model = Backbone.Model.extend({
        sync: Hyperadmin.sync,
        url: function() {
            return this.attributes.href
        },
        parse: function(response) {
          if (response.collection) {
              return response.collection.items[0];
          }
          return response;
        },
        get: function(attr) {
          var row = {"name":attr, "value":null};
          var index = 0;
          for(; index<this.attributes.data.length; index++) {
            var c_row = this.attributes.data[i]
            if (c_row["name"]==attr) {
                row = c_row
                break;
            }
          }
          return row.value;
        },
        //TODO find a better way then this long function:
        set: function(key, value, options) {
          var attrs, attr, val;

          // Handle both `"key", value` and `{key: value}` -style arguments.
          if (_.isObject(key) || key == null) {
            attrs = key;
            options = value;
          } else {
            attrs = {};
            attrs[key] = value;
          }

          // Extract attributes and options.
          options || (options = {});
          if (!attrs) return this;
          if (attrs instanceof Backbone.Model) attrs = attrs.attributes;
          if (options.unset) for (attr in attrs) attrs[attr] = void 0;

          // Run validation.
          if (!this._validate(attrs, options)) return false;

          // Check for changes of `id`.
          if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

          var changes = options.changes = {};
          if (!this.attributes.data && attrs.data) {
              this.attributes = attrs
          } else {
              var now = this.attributes;
              var escaped = this._escapedAttributes;
              var prev = this._previousAttributes || _.clone(this.attributes);

              // For each `set` attribute...
              for (attr in attrs) {
                var row = {"name":attr, "value":null};
                var index = 0;
                for(; index<this.attributes.data.length; index++) {
                  var c_row = this.attributes.data[i]
                  if (c_row["name"]==attr) {
                      row = c_row
                      break;
                  }
                }
                val = attrs[attr];

                // If the new and current value differ, record the change.
                if (!_.isEqual(row.value, val) || (options.unset && row.value == null)) {
                  delete escaped[index];
                  (options.silent ? this._silent : changes)[attr] = true;
                }

                // Update or delete the current value.
                options.unset ? delete now.data[index] : row.value = val;

                // If the new and previous value differ, record the change.  If not,
                // then remove changes for this attribute.
                if (!_.isEqual(prev.data[index], val)){// || (_.has(now, attr) != _.has(prev, attr))) {
                  this.changed[attr] = val;
                  if (!options.silent) this._pending[attr] = true;
                } else {
                  delete this.changed[attr];
                  delete this._pending[attr];
                }
              }
          }

          // Fire the `"change"` events.
          if (!options.silent) this.change(options);
          return this;
        },
    });
    
    Hyperadmin.Collection = Backbone.Collection.extend({
        sync: Hyperadmin.sync,
        model: Hyperadmin.Model,
        parse: function(response) {
            return response.collection.items;
        }
    })
    
    Hyperadmin.ResourceModel = Hyperadmin.Model.extend({
        idAttribute: "href",
        getCollection: function() {
            var res_collection = Hyperadmin.Collection.extend({
                url: this.url()
            })
            return new res_collection()
        }
    });
    
    Hyperadmin.ResourceCollection = Hyperadmin.Collection.extend({
        model: Hyperadmin.ResourceModel,
        url: $("body").attr("data-api-endpoint")
    });
    
    return Hyperadmin

}).call(this);


