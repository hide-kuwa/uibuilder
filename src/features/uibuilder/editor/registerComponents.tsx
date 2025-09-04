import React from 'react';
import PublishButton from '../../../../components/PublishButton';
import TextBlock from '../../../../components/TextBlock';
import FormBox from '../../../../components/FormBox';
import ContainerBox from '../../../../components/ContainerBox';
import { registerComponent } from './componentRegistry';

registerComponent(PublishButton, {
  id: 'publish-button',
  name: 'Publish Button',
  type: 'action',
  icon: '🚀',
  tags: ['action'],
  description: 'Triggers page publication.',
  preview: () => <PublishButton />,
  defaultProps: {},
});

registerComponent(TextBlock, {
  id: 'text-block',
  name: 'Text Block',
  type: 'visual',
  icon: '📝',
  tags: ['visual', 'text'],
  description: 'Displays simple text content.',
  preview: () => <TextBlock text="Sample text" />,
  defaultProps: { text: 'Sample text' },
});

registerComponent(FormBox, {
  id: 'form-box',
  name: 'Form',
  type: 'functional',
  icon: '📋',
  tags: ['functional', 'form'],
  description: 'Simple form container.',
  preview: () => <FormBox />,
  defaultProps: {},
});

registerComponent(ContainerBox, {
  id: 'container-box',
  name: 'Container',
  type: 'layout',
  icon: '📦',
  tags: ['layout', 'container'],
  description: 'Generic container for layout.',
  preview: () => <ContainerBox />,
  defaultProps: {},
});

