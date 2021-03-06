const React = require("react");
const theme = require("./FrontPage.css");
const hboxImg = require("../images/hbox.jpg");
const { default: Deck } = require("react-slide-deck");
const { Button, IconButton } = require("react-toolbox");
const { Link } = require("react-router-dom");

const { dataMl, codeMl } = require("./DataMl");

class FrontPage extends React.Component {
  state = {
    current: 0
  };

  handleTryNow = () => {
    const { history } = this.props;
    history.push("/user");
  };

  render() {
    const { current } = this.state;

    return (
      <div className={theme.deck}>
        {current === 1 &&
          <div className={theme.background}>
            <div
              className={theme.contain}
              dangerouslySetInnerHTML={{ __html: codeMl }}
            />
          </div>}
        {(current === 2 || current === 3) &&
          <div className={theme.background}>
            <div
              className={theme.contain}
              dangerouslySetInnerHTML={{ __html: dataMl }}
            />
          </div>}
        <Deck
          current={current}
          wheel={true}
          swipe={true}
          animate={true}
          dura={1000}
          horizontal={false}
          className={theme.deck}
          ref={deck => this.deck = deck}
          onSwitching={(factor, deck) =>
            this.setState({ current: deck.state.current })}
        >
          <Deck.Slide className={`${theme.slide} ${theme.slide1}`}>
            <img className={theme.logo} src={hboxImg} alt="hacker-box" />
            <Link className={theme.skip} to="/user">Skip Intro</Link>
            <div className={theme.center}>
              <div>
                <div className={theme.punch}>
                  Automate your frontend development
                </div>
                <div className={theme.quote}>
                  We, the Frontend developers, spend so much effort automating users workflows.
                  We analyze and optimize every click and swipe.
                  But we hardly spend any time automating our coding workflow.
                  <br /><br />
                  With frameworks like React and Redux there is so much boilerplate code
                  in modern day web apps, there are a lot of opportunities to automate beyond
                  autocomplete.
                </div>
              </div>
            </div>
            <IconButton
              className={theme.down}
              inverse
              ripple
              icon="arrow_downward"
              onClick={() => this.setState({ current: 1 })}
            />
          </Deck.Slide>
          <Deck.Slide className={theme.slide}>
            <div className={theme.center}>
              <div className={theme.para}>
                <div className={theme.text}>
                  But automating coding workflow is hard!
                </div>
                <div className={theme.text}>
                  Lets say you want to add a WebAPI everytime you add an ACTION.
                </div>
                <div className={theme.para}>
                  <div className={theme.line}>
                    You might write a script with some regex parsing to achive this automation.
                  </div>
                  <div className={theme.line}>
                    But regex are hard and there are always corner cases that will fail.
                  </div>
                </div>
                <div className={theme.text}>
                  But what if you could somehow extract a JSON representation of your code?
                </div>
                <div className={theme.dtext}>
                  <IconButton
                    ripple
                    inverse
                    icon="arrow_downward"
                    onClick={() => this.setState({ current: 2 })}
                  />
                </div>
              </div>
            </div>
          </Deck.Slide>
          <Deck.Slide className={theme.slide}>
            <div className={theme.center}>
              <div className={theme.para}>
                <div className={theme.text}>
                  Now you have something familier to work with.
                </div>
                <div className={theme.text}>
                  What if adding an entry to JSON automatically adds code?
                  Or any edits to JSON automatically changes the code.
                </div>
                <div className={theme.para}>

                  <div className={theme.line}>
                    Think of it as the "STATE" of your code,
                  </div>
                  <div className={theme.line}>
                    but with one main difference.
                  </div>
                </div>
                <div className={theme.para}>
                  <div className={theme.line}>
                    You can still modify the code in your favourite editor.
                  </div>
                  <div className={theme.line}>
                    Changes to JSON only patches the code, while retaining other changes.
                  </div>
                </div>
                <div className={theme.dtext}>
                  <IconButton
                    ripple
                    inverse
                    icon="arrow_downward"
                    onClick={() => this.setState({ current: 3 })}
                  />
                </div>
              </div>
            </div>
          </Deck.Slide>
          <Deck.Slide className={theme.slide}>
            <div className={theme.center}>
              <div className={theme.para}>
                <div className={theme.para}>
                  <div className={theme.line}>
                    As you might have guessed by now,
                  </div>
                  <div className={theme.line}>
                    this trickery involes some AST level parsing and traversing...
                  </div>
                  <div className={theme.line}>
                    and it is specific to frameworks and coding style.
                  </div>
                </div>
                <div className={theme.para}>
                  <div className={theme.line}>
                    But what if we create a pluggable architecture where you can reuse plugins
                  </div>
                  <div className={theme.line}>
                    written by others to extract JSON (and patch code) for a given framework?
                  </div>
                </div>
                <div className={theme.para}>
                  <div className={theme.line}>
                    Now automation just got a lot more easier.
                  </div>
                  <div className={theme.line}>
                    Dealing with JSON is easy for frontend developers. That
                    {"'"}
                    s what we do day-in and day-out.
                  </div>
                </div>
                <div className={theme.text}>
                  Now you can stretch your imagination on what you can automate. Even across files.
                </div>
                <div className={theme.dtext}>
                  <IconButton
                    ripple
                    inverse
                    icon="arrow_downward"
                    onClick={() => this.setState({ current: 4 })}
                  />
                </div>
              </div>
            </div>
          </Deck.Slide>
          <Deck.Slide className={theme.yellow}>
            <div className={theme.center}>
              <div className={theme.para}>
                <div className={theme.text}>
                  Examples for automation:
                </div>
                <div className={theme.text}>
                  Connecting Components to redux state.
                </div>
                <div className={theme.text}>
                  Adding index file for your directories.
                </div>
                <div className={theme.text}>
                  Auto adding exports and imports
                </div>
                <div className={theme.text}>
                  Extracting string literals to resource bundle.
                </div>
                <div className={theme.text}>
                  Switching React components from/to Functional components
                </div>
                <div className={theme.text}>
                  And anything else you can think of...
                </div>
                <div className={theme.para}>
                  <div className={theme.line}>
                    You can even take it to next level of actually triggering the actions to examine the state,
                  </div>
                  <div className={theme.line}>
                    or see the selectors (reselect) output right after you code.
                  </div>
                </div>
                <div className={theme.dtext}>
                  <IconButton
                    ripple
                    inverse
                    icon="arrow_downward"
                    onClick={() => this.setState({ current: 5 })}
                  />
                </div>
              </div>
            </div>
          </Deck.Slide>
          <Deck.Slide className={`${theme.slide} ${theme.slide1}`}>
            <img className={theme.logo} src={hboxImg} alt="hacker-box" />
            <div className={theme.center}>
              <div>
                <div className={theme.textBig}>
                  Introducing hacker-box.com
                </div>
                <div className={theme.center}>
                  <div className={theme.para}>
                    <div className={theme.text}>
                      Try the web playground to explore these concepts further.
                    </div>
                    <div className={theme.text}>
                      <Button
                        accent
                        raised
                        label="Try Now"
                        onClick={this.handleTryNow}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Deck.Slide>
        </Deck>
      </div>
    );
  }
}

module.exports = FrontPage;
