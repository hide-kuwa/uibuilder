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
  props: {},
});

registerComponent(TextBlock, {
  id: 'text-block',
  name: 'Text Block',
  type: 'visual',
  icon: '📝',
  props: { text: 'Sample text' },
});

registerComponent(FormBox, {
  id: 'form-box',
  name: 'Form',
  type: 'functional',
  icon: '📋',
  props: {},
});

registerComponent(ContainerBox, {
  id: 'container-box',
  name: 'Container',
  type: 'layout',
  icon: '📦',
  props: {},
});

