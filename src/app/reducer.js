export const initialState = {
  matches: [],
};

export function reducer(state, action) {
  const { type, value } = action;

  switch (type) {
    case 'setMatches': {
      if (!Array.isArray(value)) return state;

      window.localStorage.setItem('matches', JSON.stringify(value));
      return { ...state, matches: value };
    }
    case 'updateMatch': {
      const matches = state.matches.reduce((matches, match) => {
        if (!match?.id) return matches;

        matches.push(match.id === value.id ? value : match);

        return matches;
      }, []);

      window.localStorage.setItem('matches', JSON.stringify(matches));

      return { ...state, matches };
    }
    default:
      throw new Error();
  }
}
