import SharedFormCreate from '../../../Components/Common/SharedFormCreate';
import { MER4_CONFIG } from '../../../Config/mer4Config';

/**
 * MER4 Create/Edit Page
 * SAS Programs and Services Strategic Approaches/Actions - Yearly Submission
 */
export default function MER4Create(props) {
  return (
    <SharedFormCreate 
      {...props} 
      formType="MER4"
      config={MER4_CONFIG}
    />
  );
}
