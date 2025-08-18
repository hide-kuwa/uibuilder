import EditorBridge from './EditorBridge';

// Allowed origins the bridge will accept messages from
const bridge = new EditorBridge(['https://parent.example']);

bridge.on('style-update', (payload) => {
  console.log('style-update received', payload);
});

// Send a message using simple postMessage mode
bridge.emit('style-update', { color: 'red' });

// Simulate the parent providing a MessageChannel
const channel = new MessageChannel();
window.dispatchEvent(
  new MessageEvent('message', {
    data: { type: 'init-channel' },
    origin: 'https://parent.example',
    ports: [channel.port1],
  })
);

// Parent side (demo only)
channel.port2.onmessage = (e) => {
  console.log('parent received', e.data);
};

// Now emits go through the MessageChannel
bridge.emit('style-update', { color: 'blue' });
