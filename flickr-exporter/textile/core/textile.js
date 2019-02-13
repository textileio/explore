let _modules = []

/** 
  * Textile is an API client for a interacting with a Textile peer
  */
class Textile {
  constructor(opts) {
    this.opts = opts || {}
    this.opts.connect = function() {
      // TODO
    }

    bindModules(this)
  }

  /** addModules adds api interaction modules into the textile client */
  static addModules(modules) {
    if (!modules) {
      throw ('Unable to add a null array of modules')
    }
    
    for (let i=0; i < modules.length; i++) {
      let mod = modules[i]
      // TODO validate module interface here?
      _modules.push(mod)
    }
  }
}

function bindModules(client) {
  if (!_modules || !_modules.length) {
    throw ('Unable to create Textile client. No modules found')
  }
  
  for (i=0; i<_modules.length; i++) {
    module = new _modules[i](client.opts)
    client[module.name] = module
  }
}

module.exports = Textile
