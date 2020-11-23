import { useState, useEffect } from 'react';
import Heading from 'components/Heading';
import Text from 'components/Text';
import { useAppContext, useId } from 'hooks';
import './index.css';

const Matches = () => {
  const { matches } = useAppContext();
  const [username, setUsername] = useState();
  const id = useId();
  const sidebarId = `sidebar-${id}`;
  const contentId = `content-${id}`;

  useEffect(() => {
    if (matches) {
      const players = matches
        .map(({ players }) => players.map(({ username }) => username))
        .flat();

      const username = players
        .sort(
          (a, b) =>
            players.filter(u => u === a).length - players.filter(u => u === b).length
        )
        .pop();

      console.log(matches, username);

      return setUsername(username);
    }
  }, [matches]);

  return (
    <section className="matches">
      <div className="matches__sidebar" aria-labelledby={sidebarId}>
        <Heading id={sidebarId} className="matches__sidebar-title" level={2}>
          Match History
        </Heading>
        {matches?.map(({ id, name, level, players }) => {
          const [opponent] = players.filter(player => player.username !== username);
          const label = name || `${level} vs ${opponent.username}`;

          return (
            <div key={id} className="matches__sidebar-match">
              <Text className="matches__sidebar-match-label">{label}</Text>
            </div>
          );
        })}
      </div>
      <div className="matches__content" aria-labelledby={contentId}>
        <Heading id={contentId} className="matches__content-title" level={1}>
          Match Overview
        </Heading>
      </div>
    </section>
  );
};

export default Matches;
