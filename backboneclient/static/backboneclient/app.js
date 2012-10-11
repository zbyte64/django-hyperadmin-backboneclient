(function(){
    var root = this;
    var Hyperadmin = {};
    
    Hyperadmin.VERSION = '0.0.1';

    Hyperadmin.sync = function(method, model, options) { 
        return Backbone.sync(method, model, options);
    };
    
    Hyperadmin.Model = Backbone.Model.extend({
        "sync": Hyperadmin.sync
    });
    
    Hyperadmin.Collection = Backbone.Collection.extend({
        "model": Hyperadmin.Model
    })
    
    var Applications = Hyperadmin.Applications = function(endpoint) {
        //call endpoint to load apps
        this.applications = {};
    }
    
    _.extend(Applications.prototype, Backbone.Events, {
        initialize: function(){},
        
        findResource: function(resource_name) {
            for (a_name in this.applications) {
                if (resource_name == a_name) {
                    return this.applications[a_name];
                }
            }
            for (a_name in this.applications) {
                if (a_name.find(resource_name) > -1) {
                    return this.applications[a_name];
                }
            }
            return null;
        },
        
        addResource: function(entry) {
            var resource_name = entry.prompt;
            var resourceModel = Hyperadmin.Model.extend({
                "urlRoot": entry.url
                //TODO: use hypermedia to give the url
                //TODO: use hypermedia to do validation
            })
            var resourceCollection = Hyperadmin.Collection.extend({
                "model": resourceModel,
                "url": entry.url
            });
            this.applications[resource_name] = resourceCollection;
        }
    
    });
    
    return Hyperadmin

}).call(this);


