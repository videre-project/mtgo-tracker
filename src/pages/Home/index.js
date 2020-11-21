import React, { useEffect } from 'react';
import { useAppContext } from 'hooks';

const Home = () => {
  const { matches } = useAppContext();

  useEffect(() => {
    console.log(matches);
  }, [matches]);

  return <p>Matches: {matches?.length}</p>;
};

export default Home;
