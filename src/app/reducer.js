export const initialState = {
  location: '/',
  matches: [],
};

export function reducer(state, action) {
  const { type, value } = action;

  switch (type) {
    case 'setLocation':
      return { ...state, location: value };
    case 'setMatches':
      return { ...state, matches: value };
    case 'updateMatch': {
      const matches = state.matches.reduce((matches, match) => {
        if (!match?.id) return matches;

        matches.push(match.id === value.id ? value : match);

        return matches;
      }, []);

      return { ...state, matches };
    }
    default:
      throw new Error();
  }
}
