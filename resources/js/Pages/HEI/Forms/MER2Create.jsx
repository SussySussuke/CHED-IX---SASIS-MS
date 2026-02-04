import SharedFormCreate from '../../../Components/Common/SharedFormCreate';
import { MER2_CONFIG } from '../../../Config/mer2Config';

/**
 * MER2 Create/Edit Page
 * HEI Directory of SAS - Yearly Submission
 */
export default function MER2Create(props) {
  return (
    <SharedFormCreate 
      {...props} 
      formType="MER2"
      config={MER2_CONFIG}
    />
  );
}
