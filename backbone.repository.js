Backbone.Repository = function() {};
    
    window.Backbone.repository = new Backbone.Repository;
    
    Backbone.Repository.prototype.hash = function (value) {
        return (value.__hash || (value.__hash = ++arguments.callee.current));
    }
    
    Backbone.Repository.prototype.hash.current = 0;
    Backbone.Repository.prototype.add = function(model) {
        if (!this[this.hash(model.__proto__)]) {
            this[this.hash(model.__proto__)] = {};
        }
        
        if (!this[model.__hash][model.id || model.cid]) {
            //Look for a model that came in with only a cid, and is now saved
            var unsavedModel;
            
            if (unsavedModel = _(this[model.__hash]).find(function(m){
                return m.id == model.id;
            })) {
                model = unsavedModel;
            }

            this[model.__hash][model.id || model.cid] = model;
        }
    };
    
    Backbone.Repository.prototype.get = function(model,id) {
        if (!model.prototype.__hash) {
            return null;
        }
        
        return this[model.prototype.__hash][id];
    };
    
    Backbone.Repository.prototype.tryGet = function(model,instance) {
        var stored = this.get(model, instance.id || instance.cid);
        
        if (stored) {
            for(var attr in instance.attributes) {
                stored.attributes[attr] = instance.attributes[attr];
            }

            return stored;
        }
        
        this.add(instance);
        
        return instance;
    };
    
    (function(set) {
        Backbone.Model.prototype.set = function(attrs,options) {
            if (_(attrs).isObject() && !$.isEmptyObject(this.attributes) && this.isNew() && this.idAttribute in attrs) {
                set.call(this,attrs,options);
                Backbone.repository.add(this);
                
                return this;
            }
            
            return set.call(this,attrs,options);
        };
    })(Backbone.Model.prototype.set);