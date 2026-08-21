import autoprefixer from 'autoprefixer';
import prefixSelector from 'postcss-prefix-selector';
import tailwindcss from 'tailwindcss';

export default {
  plugins: [
    tailwindcss(),
    prefixSelector({
      prefix: '.uhub-root',
      transform(prefix, selector, prefixedSelector) {
        return selector.startsWith(prefix) ? selector : prefixedSelector;
      },
    }),
    autoprefixer(),
  ],
};
