import { themes } from '@storybook/theming';
import { addons } from '@storybook/addons';

addons.setConfig({
  theme: {
    ...themes.light,
    brandImage: 'https://videreproject.com/icon.svg',
    brandTitle: 'MTGO Tracker Components',
    brandUrl: 'https://videreproject.com',
  },
});
