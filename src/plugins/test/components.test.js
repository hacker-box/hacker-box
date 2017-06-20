const { code2data, data2code } = require("../components");
const { getDiffs } = require("../helpers");

test("code2data: simple component", () => {
  const code = `
class MyComponent extends Component {
  renderItem = () => {
    return (<div/>)
  }
  render() {
    const {items} = this.props;
    return(
      <div className={theme.className}>
      {
      	items.map(item => <Item><div>{item}</div><span>Done</span></Item>)
      }
      </div>
    )
  }
}
  `;
  expect(code2data(code)).toEqual({
    components: [
      { name: "MyComponent", children: ["Item"], functional: false }
    ],
    connect: []
  });
});

test("code2data: more than one component", () => {
  const code = `
const Item = props => <div>{item}</div>

class MyComponent extends Component {
  render() {
    const {items} = this.props;
    return(
      <div className={theme.className}>
      {
      	items.map(item => <Item><div>{item}</div><span>Done</span></Item>)
      }
      </div>
    )
  }
}
  `;
  expect(code2data(code)).toEqual({
    components: [
      { name: "Item", children: [], functional: true },
      { name: "MyComponent", children: ["Item"], functional: false }
    ],
    connect: []
  });
});

test("code2data: component with connect", () => {
  const code = `
  class _MyComponent extends Component {
    render() {
      const {items} = this.props;
      return(
        <div className={theme.className}>
        </div>
      )
    }
  }

  function mapStateToProps(state) {
    return {
      user: UserSelector(state)
    }
  }

  function mapDispatchToProps(dispatch) {
    return {
      getUser: userId => dispatch(Action.getCurrentUser(userId))
    }
  }

  const MyComponent = connect(mapStateToProps, mapDispatchToProps)(_MyComponent);
`;
  expect(code2data(code)).toEqual({
    components: [{ name: "_MyComponent", children: [], functional: false }],
    connect: [
      {
        component: "_MyComponent",
        state: { name: "mapStateToProps", map: { user: "UserSelector" } },
        dispatch: {
          name: "mapDispatchToProps",
          map: { getUser: ["Action.getCurrentUser"] }
        }
      }
    ]
  });
});

test("data2code: add component in empty file", () => {
  const code = `
const React = require("react");
`;
  const left = [{ components: [] }];
  const right = [{ components: [{ name: "MyComponent" }] }];
  const expectedCode = `
const React = require("react");

class MyComponent extends React.Component {
  render() {
    const {} = this.props;
    return <div />;
  }

}`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: add component", () => {
  const code = `
const React = require("react");
const Item = props => <div>{item}</div>;
`;
  const left = [
    { components: [{ name: "Item", children: [], functional: true }] }
  ];
  const right = [
    {
      components: [
        { name: "Item", children: [], functional: true },
        { name: "MyComponent" }
      ]
    }
  ];
  const expectedCode = `
const React = require("react");
const Item = props => <div>{item}</div>;

class MyComponent extends React.Component {
  render() {
    const {} = this.props;
    return <div />;
  }

}`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: modify component name", () => {
  const code = `
const React = require("react");
const Item = props => <div>{item}</div>;
class MyComponent extends React.Component {
  render() {
    const {} = this.props;
    return <div />;
  }

}
`;
  const left = [
    {
      components: [
        { name: "Item", children: [], functional: true },
        { name: "MyComponent", functional: false, children: [] }
      ]
    }
  ];

  const right = [
    {
      components: [
        { name: "MyItem", children: [], functional: true },
        { name: "Component", functional: false, children: [] }
      ]
    }
  ];
  const expectedCode = `
const React = require("react");
const MyItem = props => <div>{item}</div>;
class Component extends React.Component {
  render() {
    const {} = this.props;
    return <div />;
  }

}`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: modify functional false", () => {
  const code = `
const Item = props => {
  const {item} = props;
  return <div>{item}</div>;
};
`;
  const left = [
    { components: [{ name: "Item", children: [], functional: true }] }
  ];
  const right = [
    {
      components: [{ name: "Item", children: [], functional: false }]
    }
  ];
  const expectedCode = `class Item extends React.Component {
  render() {
    const { item } = this.props;
    return <div>{item}</div>;
  }

}`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: modify functional true", () => {
  const code = `
class Item extends React.Component {
  render() {
    const { item } = this.props;
    return <div>{item}</div>;
  }

}`;
  const left = [
    { components: [{ name: "Item", children: [], functional: false }] }
  ];
  const right = [
    {
      components: [{ name: "Item", children: [], functional: true }]
    }
  ];
  const expectedCode = `const Item = props => {
  const { item } = props;
  return <div>{item}</div>;
};`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: modify arrow functional false", () => {
  const code = `
const Item = props => <div>{item}</div>;
`;
  const left = [
    { components: [{ name: "Item", children: [], functional: true }] }
  ];
  const right = [
    {
      components: [{ name: "Item", children: [], functional: false }]
    }
  ];
  const expectedCode = `class Item extends React.Component {
  render() {
    return <div>{item}</div>;
  }

}`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: delete func", () => {
  const code = `
const Item = props => <div>{item}</div>;
`;
  const left = [
    {
      components: [{ name: "Item", children: [], functional: true }]
    }
  ];
  const right = [
    {
      components: []
    }
  ];
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe("");
});

test("data2code: delete comp", () => {
  const code = `
class MyComponent extends React.Component {
  render() {
    return <div/>
  }
}
`;
  const left = [
    {
      components: [{ name: "MyComponent", children: [], functional: false }]
    }
  ];
  const right = [
    {
      components: []
    }
  ];
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe("");
});

test("data2code: connect add", () => {
  const code = `
class MyComponent extends React.Component {
  render() {
    return <div/>
  }
}

module.exports = MyComponent;
`;
  const left = [
    {
      components: [{ name: "MyComponent", children: [], functional: false }],
      connect: []
    }
  ];
  const right = [
    {
      components: [{ name: "MyComponent", children: [], functional: false }],
      connect: [
        {
          component: "MyComponent",
          state: { name: "mapStateToProps", map: { user: "UserSelector" } },
          dispatch: {
            name: "mapDispatchToProps",
            map: { getUser: ["Action.getCurrentUser"] }
          }
        }
      ]
    }
  ];
  const expectedCode = `
class MyComponent extends React.Component {
  render() {
    return <div />;
  }
}

function mapStateToProps(state) {
  return {
    user: UserSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUser: () => dispatch(Action.getCurrentUser())
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(_MyComponent);
module.exports = MyComponent;`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});
