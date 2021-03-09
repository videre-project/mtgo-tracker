export const initialState = {
  location: '/',
  matches: [],
};

export function reducer(state, action) {
  const { type, value } = action;

  switch (type) {
    case 'setLocation':
      window.localStorage.setItem('location', JSON.stringify(value));
      return { ...state, location: value };
    case 'setMatches': {
      window.localStorage.setItem('matches', JSON.stringify(value));
      return { ...state, matches: value };
    }
    default:
      throw new Error();
  }
}
