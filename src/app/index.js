import { lazy, Suspense, useEffect, createContext, useReducer, Fragment } from 'react';
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

const Splash = lazy(() => import('pages/Splash'));
const Matches = lazy(() => import('pages/Matches'));

export const AppContext = createContext();
export const TransitionContext = createContext();

const repoPrompt = `\u00A9 2020-${new Date().getFullYear()} Videre Project\n\nCheck out the source code: https://github.com/videre-project/mtgo-tracker\n\n`;

const App = () => {
  const [storedLocation] = useLocalStorage('location', '/');
  const [storedMatches] = useLocalStorage('matches', []);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { location } = state;

  useEffect(() => {
    if (!prerender) {
      console.info(repoPrompt);
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'setLocation', value: storedLocation });
  }, [storedLocation]);

  useEffect(() => {
    dispatch({ type: 'setMatches', value: storedMatches });
  }, [storedMatches]);

  useEffect(() => {
    let unsubscribe;

    if (!prerender && window.tracker) {
      unsubscribe = window.tracker.subscribe('matches', value => {
        dispatch({ type: 'setMatches', value });
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
                  <Suspense fallback={<Fragment />}>
                    {location === '/' && <Splash />}
                    {location === '/matches' && <Matches />}
                  </Suspense>
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
