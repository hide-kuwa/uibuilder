import React from 'react';

/**
 * Props for the {@link TextBlock} component.
 */
export interface TextBlockProps {
  /** Text content to display */
  text?: string;
}

/**
 * Displays a small block of text.
 */
const TextBlock: React.FC<TextBlockProps> = ({ text = 'Text block' }) => {
  return <div className="p-2">{text}</div>;
};

export default TextBlock;
