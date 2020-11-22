import classNames from 'classnames';
import { useAppContext } from 'hooks';
import { blurOnMouseUp } from 'utils/focus';
import './index.css';

// File extensions that can be linked to
const VALID_EXT = ['txt', 'png', 'jpg'];

const Link = ({ rel, target, children, secondary, className, href, as, ...rest }) => {
  const isValidExtension = VALID_EXT.includes(href?.split('.').pop());
  const isAnchor = href?.includes('://') || href?.[0] === '#' || isValidExtension;
  const relValue = rel || isAnchor ? 'noreferrer noopener' : undefined;
  const targetValue = target || isAnchor ? '_blank' : undefined;
  const { setLocation } = useAppContext();

  const onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    return setLocation(href);
  };

  return (
    <a
      className={classNames('link', className, { 'link--secondary': secondary })}
      rel={relValue}
      href={isAnchor ? href : undefined}
      target={targetValue}
      onMouseUp={blurOnMouseUp}
      onClick={!isAnchor ? onClick : undefined}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
