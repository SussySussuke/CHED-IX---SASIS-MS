import React from 'react';
import SharedMERForm from '../../../Components/MER/SharedMERForm';

/**
 * Form 1 Index - Student Welfare Services (Annexes A-D)
 * Uses SharedMERForm component with formNumber=1
 */
const Form1Index = (props) => {
  return <SharedMERForm formNumber={1} {...props} />;
};

export default Form1Index;