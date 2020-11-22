import { lazy, Suspense, useState, useEffect, createContext, useReducer, Fragment } from 'react';
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

const Home = lazy(() => import('pages/Home'));
const Matches = lazy(() => import('pages/Matches'));

export const AppContext = createContext();
export const TransitionContext = createContext();

const repoPrompt = `\u00A9 2019-${new Date().getFullYear()} Videre Project\n\nCheck out the source code: https://github.com/videre-project/mtgo-tracker`;

const App = () => {
  const [location, setLocation] = useState('/');
  const [storedTheme] = useLocalStorage('theme', 'light');
  const [storedMatches] = useLocalStorage('matches');
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!prerender) {
      console.info(`${repoPrompt}\n\n`);
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'setTheme', value: storedTheme });
  }, [storedTheme]);

  useEffect(() => {
    dispatch({ type: 'setMatches', value: storedMatches });
  }, [storedMatches]);

  return (
    <AppContext.Provider value={{ ...state, dispatch, setLocation }}>
      <ThemeProvider themeId={state.theme}>
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
                  {location === '/' && <Home />}
                  {location === '/matches' && <Matches />}
                </Suspense>
              </div>
            </TransitionContext.Provider>
          )}
        </Transition>
      </TransitionGroup>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
