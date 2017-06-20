const React = require("react");
const ReactDomServer = require("react-dom/server");
const HtmlDocument = require("./common/containers/HtmlDocument");

export function createHtmlResponse(
  {
    webpackStats,
    request
  }
) {
  return new Promise((resolve, reject) => {
    const html = ReactDomServer.renderToStaticMarkup(
      <HtmlDocument webpackStats={webpackStats} user={request.user} />
    );

    resolve({
      status: 200,
      body: `<!DOCTYPE html>${html}`
    });
  });
}
