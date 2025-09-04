import React from 'react';

const ContainerBox: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="p-4 border-2 border-dashed">{children}</div>;
};

export default ContainerBox;
