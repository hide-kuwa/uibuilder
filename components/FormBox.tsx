import React from 'react';

/**
 * Simple form container with a single input field.
 */
const FormBox: React.FC = () => {
  return (
    <form className="p-2 border rounded">
      <input className="border p-1" placeholder="Input" />
    </form>
  );
};

export default FormBox;
