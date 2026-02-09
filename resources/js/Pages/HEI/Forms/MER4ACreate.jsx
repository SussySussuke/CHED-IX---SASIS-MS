import SharedFormCreate from '../../../Components/Common/SharedFormCreate';
import { MER4A_CONFIG } from '../../../Config/mer4aConfig';

/**
 * MER4A Create/Edit Page
 * SAS Programs and Services Strategic Approaches/Actions - Yearly Submission
 */
export default function MER4ACreate(props) {
  return (
    <SharedFormCreate 
      {...props} 
      formType="MER4A"
      config={MER4A_CONFIG}
    />
  );
}
