export const initialState = {
  theme: 'light',
  matches: null,
};

export function reducer(state, action) {
  const { type, value } = action;

  switch (type) {
    case 'setTheme':
      return { ...state, theme: value };
    case 'toggleTheme': {
      const newThemeId = state.theme === 'light' ? 'dark' : 'light';
      return { ...state, theme: newThemeId };
    }
    case 'setMatches':
      return { ...state, matches: value };
    default:
      throw new Error();
  }
}
