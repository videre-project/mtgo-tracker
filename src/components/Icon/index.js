import classNames from 'classnames';
import { ReactComponent as Error } from 'assets/icons/error.svg';
import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import './index.css';

export const icons = {
  error: Error,
  logo: Logo,
};

const Icon = ({ icon, style, className, ...rest }) => {
  const IconComponent = icons[icon];

  return (
    <IconComponent aria-hidden className={classNames('icon', className)} {...rest} />
  );
};

export default Icon;
