import React from 'react';
import SharedMERForm from '../../../Components/MER/SharedMERForm';

/**
 * Form 3 Index - Institutional Student Programs and Services (Annexes H-O)
 * Uses SharedMERForm component with formNumber=3
 */
const Form3Index = (props) => {
  return <SharedMERForm formNumber={3} {...props} />;
};

export default Form3Index;
