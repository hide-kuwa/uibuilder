import React from 'react';

const TextBlock: React.FC<{ text?: string }> = ({ text = 'Text block' }) => {
  return <div className="p-2">{text}</div>;
};

export default TextBlock;
