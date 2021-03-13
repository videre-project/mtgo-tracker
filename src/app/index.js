import { useEffect, createContext, useReducer } from 'react';
import classNames from 'classnames';
import { Transition, TransitionGroup } from 'react-transition-group';
import ThemeProvider from 'components/ThemeProvider';
import VisuallyHidden from 'components/VisuallyHidden';
import { tokens } from 'components/ThemeProvider/theme';
import { msToNum } from 'utils/style';
import { useLocalStorage } from 'hooks';
import { initialState, reducer } from 'app/reducer';
import { reflow } from 'utils/transition';
import prerender from 'utils/prerender';
import './reset.css';
import './index.css';

export const AppContext = createContext();
export const TransitionContext = createContext();

const repoPrompt = `\u00A9 2020-${new Date().getFullYear()} Videre Project\n\nCheck out the source code: https://github.com/videre-project/videre-tracker\n\n`;

const App = () => {
  const [storedMatches] = useLocalStorage('matches', []);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { location } = state;

  useEffect(() => {
    if (!prerender) {
      console.info(repoPrompt);
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'setMatches', value: storedMatches });
  }, [storedMatches]);

  useEffect(() => {
    let unsubscribe;

    if (!prerender && window.tracker) {
      unsubscribe = window.tracker.subscribe('match-update', match => {
        console.info('match-update', match.id);

        dispatch({ type: 'updateMatch', value: match });
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      <AppContext.Provider value={{ ...state, dispatch }}>
        <VisuallyHidden showOnFocus as="a" className="skip-to-main" href="#MainContent">
          Skip to main content
        </VisuallyHidden>
        <TransitionGroup component="main" className="app" tabIndex={-1} id="MainContent">
          <Transition
            key={location}
            timeout={msToNum(tokens.base.durationS)}
            onEnter={reflow}
          >
            {status => (
              <TransitionContext.Provider value={{ status }}>
                <div className={classNames('app__page', `app__page--${status}`)}>
                  {/* Routes */}
                </div>
              </TransitionContext.Provider>
            )}
          </Transition>
        </TransitionGroup>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
