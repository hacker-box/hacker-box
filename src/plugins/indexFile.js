const {
  addExport,
  getFileName,
  removeExport,
  addRequire,
  removeRequire
} = require("./helpers");

const suggestionsCreator = codeType =>
  (memo, file) => {
    const suggestions = [];
    const { filePath, action: diff } = memo.update;
    const { action, path, value } = diff;
    const fileName = getFileName(filePath);

    if (path.length !== 0) {
      return;
    }
    if (value[codeType]) {
      if (action === "added") {
        suggestions.push({
          action: addExport(fileName),
          caption: `Add "${fileName}" to exports`
        });
        suggestions.push({
          action: addRequire({
            module: `./${fileName}`,
            variables: fileName
          }),
          caption: `Add "${fileName}" to require()`
        });
      } else if (action === "deleted") {
        suggestions.push({
          action: removeExport(fileName),
          caption: `Remove "${fileName}" from exports`
        });
        suggestions.push({
          action: removeRequire({
            module: `./${fileName}`,
            variables: fileName
          }),
          caption: `Remove "${fileName}" from requires`
        });
      }
    }

    return {
      ...memo,
      suggestions: memo.suggestions.concat(suggestions)
    };
  };

const newFileContentCreator = (codeType, pluginName) =>
  memo => ({
    ...memo,
    [`${pluginName}Index`]: {
      doc: `
Index file for this directory.

This file won't have any logic other than require'ing and exporting
other files in this directory. You will get notification to update
this file as you add other files in this dir.

  `,
      src: `
  module.exports = {
  };
  `
    }
  });

function indexFileCreator(codeType, pluginName) {
  return {
    suggestions: suggestionsCreator(codeType, pluginName),
    newFileContent: newFileContentCreator(codeType, pluginName)
  };
}

module.exports = indexFileCreator;
