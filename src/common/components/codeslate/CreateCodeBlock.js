function createCodeBlock(code) {
  const lines = code.split("\n");
  return JSON.stringify({
    nodes: [
      {
        kind: "block",
        type: "code_block",
        nodes: lines.map(line => ({
          kind: "block",
          type: "code_line",
          nodes: [
            {
              kind: "text",
              ranges: [
                {
                  text: line
                }
              ]
            }
          ]
        }))
      }
    ]
  });
}

module.exports = createCodeBlock;
