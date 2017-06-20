const Tapable = require("tapable");

const codeDataPlugin = (function() {
  function CodeDataPlugin() {
    Tapable.call(this);
  }

  CodeDataPlugin.prototype = Object.create(Tapable.prototype);

  CodeDataPlugin.prototype.applyPluginsWithReturns = function(name) {
    const ret = [];
    if (!this._plugins[name]) return ret;
    const args = Array.prototype.slice.call(arguments, 1);
    const plugins = this._plugins[name];
    for (let i = 0; i < plugins.length; i++) {
      const val = plugins[i].apply(this, args);
      if (val) {
        ret.push(val);
      }
    }
    return ret;
  };

  CodeDataPlugin.prototype.getDataFromCode = function(name, code, ...rest) {
    return this.applyPluginsWithReturns(`${name}.code2data`, code, ...rest);
  };

  CodeDataPlugin.prototype.getCodeFromData = function(name, code, ...rest) {
    return this.applyPluginsWaterfall(`${name}.data2code`, code, ...rest);
  };

  CodeDataPlugin.prototype.getSuggestions = function(name, update, file) {
    return this.applyPluginsWaterfall(
      `${name}.suggestions`,
      { update, suggestions: [] },
      file
    );
  };

  CodeDataPlugin.prototype.newFileContent = function(name) {
    return this.applyPluginsWaterfall(`${name}.newFileContent`, {});
  };

  return new CodeDataPlugin();
})();

function registerVisitors(codeType, handler) {
  const { code2data, data2code, suggestions, newFileContent } = handler;
  if (code2data) {
    codeDataPlugin.plugin(`${codeType}.code2data`, code2data);
  }
  if (data2code) {
    codeDataPlugin.plugin(`${codeType}.data2code`, data2code);
  }
  if (suggestions) {
    codeDataPlugin.plugin(`${codeType}.suggestions`, suggestions);
  }

  if (newFileContent) {
    codeDataPlugin.plugin(`${codeType}.newFileContent`, newFileContent);
  }
}

function getDataFromCode(codeType, code, ...rest) {
  return codeDataPlugin.getDataFromCode(codeType, code, ...rest);
}

function getCodeFromData(codeType, data, ...rest) {
  return codeDataPlugin.getCodeFromData(codeType, data, ...rest);
}

function getSuggestions(codeType, actions, file) {
  const result = codeDataPlugin.getSuggestions(codeType, actions, file);
  if (!result || !result.suggestions) {
    console.error(
      "Plugin did not return suggestion propertly. Check your suggestions() code",
      codeType
    );
    return [];
  }
  return result.suggestions;
}

function newFileContent(codeType) {
  return codeDataPlugin.newFileContent(codeType);
}

module.exports = {
  registerVisitors,
  getDataFromCode,
  getCodeFromData,
  getSuggestions,
  newFileContent
};
