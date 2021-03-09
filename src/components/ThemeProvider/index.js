import { createContext, useMemo, useEffect, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import useTheme from './useTheme';
import { theme, tokens } from './theme';
import { usePrefersColorScheme } from 'hooks';
import { media } from 'utils/style';
import RobotoRegular from 'assets/fonts/roboto-regular.woff2';
import RobotoMedium from 'assets/fonts/roboto-medium.woff2';
import RobotoBold from 'assets/fonts/roboto-bold.woff2';

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

const ThemeContext = createContext({});

const ThemeProvider = ({
  themeId,
  theme: themeOverrides,
  children,
  className,
  as: Component = 'div',
}) => {
  const colorScheme = usePrefersColorScheme();
  const currentTheme = useMemo(() => {
    return { ...theme[colorScheme || themeId], ...themeOverrides };
  }, [colorScheme, themeId, themeOverrides]);
  const parentTheme = useTheme();
  const isRootProvider = !parentTheme.themeId;

  // Save root theme id to localstorage and apply class to body
  useEffect(() => {
    if (isRootProvider) {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(currentTheme.themeId);
    }
  }, [isRootProvider, currentTheme]);

  return (
    <ThemeContext.Provider value={currentTheme}>
      {/* Add fonts and base tokens for the root provider */}
      {isRootProvider && (
        <Fragment>
          <Helmet>
            <link rel="preload" href={RobotoRegular} as="font" crossorigin="" />
            <link rel="preload" href={RobotoMedium} as="font" crossorigin="" />
            <link rel="preload" href={RobotoBold} as="font" crossorigin="" />
            <style>{fontStyles}</style>
            <style>{tokenStyles}</style>
          </Helmet>
          {children}
        </Fragment>
      )}
      {/* Nested providers need a div to override theme tokens */}
      {!isRootProvider && (
        <Component
          className={classNames('theme-provider', className)}
          style={createThemeStyleObject(currentTheme)}
        >
          {children}
        </Component>
      )}
    </ThemeContext.Provider>
  );
};

/**
 * Transform theme token objects into CSS custom property strings
 */
function createThemeProperties(theme) {
  return Object.keys(theme)
    .filter(key => key !== 'themeId')
    .map(key => `--${key}: ${theme[key]};`)
    .join('\n');
}

/**
 * Transform theme tokens into a React CSSProperties object
 */
function createThemeStyleObject(theme) {
  let style = {};

  for (const key of Object.keys(theme)) {
    if (key !== 'themeId') {
      style[`--${key}`] = theme[key];
    }
  }

  return style;
}

/**
 * Generate media queries for tokens
 */
function createMediaTokenProperties() {
  return Object.keys(media)
    .map(key => {
      return `
        @media (max-width: ${media[key]}px) {
          :root {
            ${createThemeProperties(tokens[key])}
          }
        }
      `;
    })
    .join('\n');
}

export const tokenStyles = `
  :root {
    ${createThemeProperties(tokens.base)}
  }

  .dark {
    ${createThemeProperties(theme.dark)}
  }

  .light {
    ${createThemeProperties(theme.light)}
  }

  ${createMediaTokenProperties()}
`;

export {
  theme,
  useTheme,
  ThemeContext,
  createThemeProperties,
  createThemeStyleObject,
  createMediaTokenProperties,
};

export default ThemeProvider;
