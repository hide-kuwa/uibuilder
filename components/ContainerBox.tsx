import React from 'react';

/**
 * Props for the {@link ContainerBox} component.
 */
export interface ContainerBoxProps {
  /** Content to render inside the container */
  children?: React.ReactNode;
}

/**
 * Generic container for layout.
 */
const ContainerBox: React.FC<ContainerBoxProps> = ({ children }) => {
  return <div className="p-4 border-2 border-dashed">{children}</div>;
};

export default ContainerBox;
