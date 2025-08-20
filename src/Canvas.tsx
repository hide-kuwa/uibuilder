import React from 'react';
import PageRenderer from './PageRenderer';
import { useEditorState, useEditorActions } from './store';

const Canvas: React.FC = () => {
  const { tree, hoverPreview } = useEditorState();
  const { setHoverPreview } = useEditorActions();
  return (
    <div className="h-full w-full">
      <div className="p-2 border-b flex items-center space-x-2">
        <input type="checkbox" checked={hoverPreview} onChange={(e) => setHoverPreview(e.target.checked)} />
        <span className="text-sm">Hover preview</span>
      </div>
      <div className="p-4">
        <PageRenderer tree={tree} previewHover={hoverPreview} />
      </div>
    </div>
  );
};

export default Canvas;
