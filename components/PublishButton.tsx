import React from 'react';
import { useEditorState } from '../src/store';

const PublishButton: React.FC = () => {
  const { tree } = useEditorState();

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pages/home/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          author: 'demo',
          json: tree,
        }),
      });

      if (!res.ok) {
        console.error('Publish failed', res.statusText);
        return;
      }

      const data = await res.json();
      console.log(data.version_id);
    } catch (err) {
      console.error('Publish error', err);
    }
  };

  return (
    <button
      onClick={handlePublish}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Publish
    </button>
  );
};

export default PublishButton;
