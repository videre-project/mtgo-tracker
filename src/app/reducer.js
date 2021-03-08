export const initialState = {
  location: '/',
  theme: 'light',
  matches: [],
};

export function reducer(state, action) {
  const { type, value } = action;

  switch (type) {
    case 'setLocation':
      return { ...state, location: value };
    case 'setTheme':
      return { ...state, theme: value };
    case 'toggleTheme': {
      const newThemeId = state.theme === 'light' ? 'dark' : 'light';
      return { ...state, theme: newThemeId };
    }
    case 'setMatches': {
      window.localStorage.setItem('matches', JSON.stringify(value));
      return { ...state, matches: value };
    }
    default:
      throw new Error();
  }
}
