import { lazy, Suspense, useEffect, createContext, useReducer, Fragment } from 'react';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { Transition, TransitionGroup } from 'react-transition-group';
import VisuallyHidden from 'components/VisuallyHidden';
import { tokens, tokenStyles } from 'app/theme';
import { msToNum } from 'utils/style';
import { useLocalStorage } from 'hooks';
import { initialState, reducer } from 'app/reducer';
import { reflow } from 'utils/transition';
import prerender from 'utils/prerender';
import RobotoRegular from 'assets/fonts/roboto-regular.woff2';
import RobotoMedium from 'assets/fonts/roboto-medium.woff2';
import RobotoBold from 'assets/fonts/roboto-bold.woff2';
import './reset.css';
import './index.css';

const Splash = lazy(() => import('pages/Splash'));
const Matches = lazy(() => import('pages/Matches'));

export const AppContext = createContext();
export const TransitionContext = createContext();

const fontStyles = `
  @font-face {
    font-family: "Roboto";
    font-weight: 400;
    src: url(${RobotoRegular}) format("woff");
    font-display: swap;
  }

  @font-face {
    font-family: "Roboto";
    font-weight: 500;
    src: url(${RobotoMedium}) format("woff2");
    font-display: swap;
  }

  @font-face {
    font-family: "Roboto";
    font-weight: 700;
    src: url(${RobotoBold}) format("woff2");
    font-display: swap;
  }
`;

const repoPrompt = `\u00A9 2018-${new Date().getFullYear()} Videre Project\n\nCheck out the source code: https://github.com/videre-project/mtgo-tracker`;

const App = () => {
  const [storedLocation] = useLocalStorage('location', '/');
  const [storedTheme] = useLocalStorage('theme', 'light');
  const [storedMatches] = useLocalStorage('matches', []);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { location } = state;

  useEffect(() => {
    if (!prerender) {
      console.info(`${repoPrompt}\n\n`);
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'setLocation', value: storedLocation });
  }, [storedLocation]);

  useEffect(() => {
    dispatch({ type: 'setTheme', value: storedTheme });
  }, [storedTheme]);

  useEffect(() => {
    dispatch({ type: 'setMatches', value: storedMatches });
  }, [storedMatches]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      <Helmet>
        <style>{fontStyles}</style>
        <style>{tokenStyles}</style>
      </Helmet>
      <VisuallyHidden showOnFocus as="a" className="skip-to-main" href="#MainContent">
        Skip to main content
      </VisuallyHidden>
      <TransitionGroup component="main" className="app" tabIndex={-1} id="MainContent">
        <Transition key={location} timeout={msToNum(tokens.durationS)} onEnter={reflow}>
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
  );
};

export default App;
