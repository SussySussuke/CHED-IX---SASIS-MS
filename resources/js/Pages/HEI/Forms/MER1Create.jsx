import SharedFormCreate from '../../../Components/Common/SharedFormCreate';
import { MER1_CONFIG } from '../../../Config/mer1Config';

/**
 * MER1 Create/Edit Page
 * HEI Profile on SAS - Yearly Submission
 */
export default function MER1Create(props) {
  return (
    <SharedFormCreate 
      {...props} 
      formType="MER1"
      config={MER1_CONFIG}
    />
  );
}
