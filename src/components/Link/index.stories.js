import Link from 'components/Link';
import { StoryContainer } from '../../../.storybook/StoryContainer';

export default {
  title: 'Link',
};

export const link = () => (
  <StoryContainer style={{ fontSize: 18 }}>
    <Link href="#" onClick={e => e.preventDefault()}>
      Anchor Link
    </Link>
  </StoryContainer>
);
