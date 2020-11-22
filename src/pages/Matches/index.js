import { useEffect } from 'react';
import Heading from 'components/Heading';
import { useAppContext, useId } from 'hooks';
import './index.css';

const Matches = () => {
  const { matches } = useAppContext();
  const id = useId();
  const sidebarId = `sidebar-${id}`;
  const contentId = `content-${id}`;

  useEffect(() => {
    console.log(matches);
  }, [matches]);

  return (
    <section className="matches">
      <div className="matches__sidebar" aria-labelledby={sidebarId}>
        <Heading id={sidebarId} className="matches__sidebar-title" level={2}>
          Match History
        </Heading>
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
