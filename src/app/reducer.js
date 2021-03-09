export const initialState = {
  matches: [],
};

export function reducer(state, action) {
  const { type, value } = action;

  switch (type) {
    case 'setMatches': {
      window.localStorage.setItem('matches', JSON.stringify(value));
      return { ...state, matches: value };
    }
    default:
      throw new Error();
  }
}
