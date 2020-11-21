export const initialState = {
  theme: 'light',
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
    default:
      throw new Error();
  }
}
