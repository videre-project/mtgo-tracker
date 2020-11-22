import Heading from 'components/Heading';
import Text from 'components/Text';
import { useId } from 'hooks';

const Matches = () => {
  const id = useId();
  const titleId = `title-${id}`;

  return (
    <section
      className="matches"
      aria-labelledby={titleId}
    >
      <Heading level={4} id={titleId}>Match Overview</Heading>
      <Text>
        ...
      </Text>
    </section>
  );
};

export default Matches;
