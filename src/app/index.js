import { Suspense, useEffect, createContext, useReducer, Fragment } from 'react';
import { BrowserRouter, Switch, Route, useLocation } from 'react-router-dom';
import { Transition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';
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

const repoPrompt = `\u00A9 2019-${new Date().getFullYear()} Cody Bennett\n\nCheck out the source code: https://github.com/videre-project/mtgo-tracker`;

const App = () => {
  const [storedTheme] = useLocalStorage('theme', 'light');
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!prerender) {
      console.info(`${repoPrompt}\n\n`);
    }

    window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    dispatch({ type: 'setTheme', value: storedTheme });
  }, [storedTheme]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      <ThemeProvider themeId={state.theme}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <Fragment>
      <VisuallyHidden showOnFocus as="a" className="skip-to-main" href="#MainContent">
        Skip to main content
      </VisuallyHidden>
      <TransitionGroup component="main" className="app" tabIndex={-1} id="MainContent">
        <Transition
          key={pathname}
          timeout={msToNum(tokens.base.durationS)}
          onEnter={reflow}
        >
          {status => (
            <TransitionContext.Provider value={{ status }}>
              <div className={classNames('app__page', `app__page--${status}`)}>
                <Suspense fallback={<Fragment />}>
                  <Switch location={location}>
                    <Route render={() => <p>MTGO Tracker</p>} />
                  </Switch>
                </Suspense>
              </div>
            </TransitionContext.Provider>
          )}
        </Transition>
      </TransitionGroup>
    </Fragment>
  );
};

export default App;
