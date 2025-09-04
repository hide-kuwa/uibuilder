import React from 'https://esm.sh/react@18';

export default {
  Box: (props) => React.createElement('div', { style: { padding: '8px', border: '1px solid #ccc', ...(props.style || {}) } }, props.children),
  Text: (props) => React.createElement('span', props, props.children)
};
