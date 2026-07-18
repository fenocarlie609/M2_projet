// src/shared/components/ui/Form.jsx
import React from "react";

export const Form = ({ children, onSubmit, className = "" }) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className={`space-y-4 sm:space-y-5 ${className}`}
    >
      {children}
    </form>
  );
};
