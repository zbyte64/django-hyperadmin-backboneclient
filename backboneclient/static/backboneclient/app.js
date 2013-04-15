(function(){
    var root = this;
    var Hyperadmin;
    if (typeof exports !== 'undefined') {
      Hyperadmin = exports;
    } else {
      Hyperadmin = root.Hyperadmin = {};
    }


    Hyperadmin.VERSION = '0.0.1';
    Hyperadmin.CONTENT_TYPE = 'application/vnd.collection+json';
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

    Hyperadmin.Link = function(obj) {
        var self = {}
        self.attributes = obj;
        self.follow = function() {
            var link_collection = Hyperadmin.Collection.extend({url:self.attributes["href"]})
            return new link_collection()
        }
        return self;
    }

    Hyperadmin.FormTemplate = function(obj) {
        var self = {}
        self.attributes = obj;
        return self;
    }

    Hyperadmin.Model = Backbone.Model.extend({
        sync: Hyperadmin.sync,
        url: function() {
          if (this.attributes && this.attributes.href) {
            return this.attributes.href
          }
          var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url');
          if (this.isNew()) return base;
          return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id) + '/';
        },
        parse: function(response) {
          if (response.collection) {
              this._form_template = Hyperadmin.FormTemplate(response.collection.template);
              this._links = _.map(response.collection.links || [], Hyperadmin.Link);
              this._queries = _.map(response.collection.queries || [], Hyperadmin.Link);
              return response.collection.items[0];
          }
          return response;
        },
        get: function(attr) {
          var row = {"name":attr, "value":null};
          var index = 0;
          for(; index<this.attributes.data.length; index++) {
            var c_row = this.attributes.data[index]
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
              if (!this.attributes.data) {
                this.attributes = {"data":[]}
              }
              var now = this.attributes;
              var escaped = this._escapedAttributes;
              var prev = this._previousAttributes || _.clone(this.attributes);

              // For each `set` attribute...
              for (attr in attrs) {
                var row = {"name":attr, "value":null, "type":"text"};
                var index = 0;
                var new_attribute = true;
                for(; index<this.attributes.data.length; index++) {
                  var c_row = this.attributes.data[index]
                  if (c_row["name"]==attr) {
                      row = c_row
                      new_attributes = false;
                      break;
                  }
                }
                if (new_attribute) {
                    this.attributes.data.push(row);
                    index += 1;
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
                if (new_attribute || !_.isEqual(prev.data[index], val)){
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
        links: function() {
            return _.union(_.map(this.attributes.links, Hyperadmin.Link), this._links)
        },
        form_template: function() {
            return this._form_template;
        }
    });

    Hyperadmin.Collection = Backbone.Collection.extend({
        sync: Hyperadmin.sync,
        model: Hyperadmin.Model,
        parse: function(response) {
            //parse out forms and filters
            var items = response.collection.items;
            this._links = _.map(response.collection.links || [], Hyperadmin.Link);
            this._queries = _.map(response.collection.queries || [], Hyperadmin.Link);
            this._form_template = Hyperadmin.FormTemplate(response.collection.template);
            return items
        },
        links: function() {
            return this._links;
        },
        queries: function() {
            return this._queries;
        },
        form_template: function() {
            return this._form_template;
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
        authenticate: function(username, password, options) {
            var target = this.url + '-authentication/'
            var payload = {'data': [
                {"name":"username", "value":username, "type":"text"},
                {"name":"password", "value":password, "type":"text"}
            ]}
            params = {"data": JSON.stringify(payload),
                      "dataType": "json",
                      "type": "POST",
                      "accepts": {"json":Hyperadmin.ACCEPT},
                      "contentType": Hyperadmin.CONTENT_TYPE,
                      "url": target}
            return $.ajax(_.extend(params, options));
        }
    });

    var getValue = function(object, prop) {
      if (!(object && object[prop])) return null;
      return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };

    return Hyperadmin

}).call(this);


