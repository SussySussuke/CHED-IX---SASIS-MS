import SharedFormCreate from '../../../Components/Common/SharedFormCreate';
import { MER3_CONFIG } from '../../../Config/mer3Config';

/**
 * MER3 Create/Edit Page
 * Matrix of School Fees for SAS Programs and Activities - Yearly Submission
 */
export default function MER3Create(props) {
  return (
    <SharedFormCreate 
      {...props} 
      formType="MER3"
      config={MER3_CONFIG}
    />
  );
}
