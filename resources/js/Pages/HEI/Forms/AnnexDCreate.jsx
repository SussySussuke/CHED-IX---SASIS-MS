import React, { useState, useEffect } from 'react';
import HEILayout from '../../../Layouts/HEILayout';
import { router } from '@inertiajs/react';
import InfoBox from '../../../Components/Widgets/InfoBox';
import { CURRENT_YEAR } from '../../../Utils/constants';
import { getSubmissionStatusMessage } from '../../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../../Utils/urlHelpers';
import { IoSave } from 'react-icons/io5';
import AcademicYearSelect from '../../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../../Components/Forms/FormSelector';
import { buildFormOptionsGrouped } from '../../../Config/formConfig';
import { getFormRoute } from '../../../Config/nonAnnexForms';

const Create = ({ availableYears = [], existingBatches = {}, defaultYear, isEditing = false }) => {
  const currentAcademicYear = getAcademicYearFromUrl(defaultYear);
  const formOptions = buildFormOptionsGrouped();
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [processing, setProcessing] = useState(false);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);

  const existingBatch = existingBatches[selectedYear];
  const formData = existingBatch?.formData;

  // Form state
  const [data, setData] = useState({
    version_publication_date: formData?.version_publication_date || '',
    officer_in_charge: formData?.officer_in_charge || '',
    handbook_committee: formData?.handbook_committee || '',
    dissemination_orientation: formData?.dissemination_orientation || false,
    orientation_dates: formData?.orientation_dates || '',
    mode_of_delivery: formData?.mode_of_delivery || '',
    dissemination_uploaded: formData?.dissemination_uploaded || false,
    dissemination_others: formData?.dissemination_others || false,
    dissemination_others_text: formData?.dissemination_others_text || '',
    type_digital: formData?.type_digital || false,
    type_printed: formData?.type_printed || false,
    type_others: formData?.type_others || false,
    type_others_text: formData?.type_others_text || '',
    has_academic_policies: formData?.has_academic_policies || false,
    has_admission_requirements: formData?.has_admission_requirements || false,
    has_code_of_conduct: formData?.has_code_of_conduct || false,
    has_scholarships: formData?.has_scholarships || false,
    has_student_publication: formData?.has_student_publication || false,
    has_housing_services: formData?.has_housing_services || false,
    has_disability_services: formData?.has_disability_services || false,
    has_student_council: formData?.has_student_council || false,
    has_refund_policies: formData?.has_refund_policies || false,
    has_drug_education: formData?.has_drug_education || false,
    has_foreign_students: formData?.has_foreign_students || false,
    has_disaster_management: formData?.has_disaster_management || false,
    has_safe_spaces: formData?.has_safe_spaces || false,
    has_anti_hazing: formData?.has_anti_hazing || false,
    has_anti_bullying: formData?.has_anti_bullying || false,
    has_violence_against_women: formData?.has_violence_against_women || false,
    has_gender_fair: formData?.has_gender_fair || false,
    has_others: formData?.has_others || false,
    has_others_text: formData?.has_others_text || '',
  });

  const [requestNotes, setRequestNotes] = useState('');

  // Update form data when selected year changes
  useEffect(() => {
    const batch = existingBatches[selectedYear];
    const batchFormData = batch?.formData;
    if (batchFormData) {
      setData({
        version_publication_date: batchFormData?.version_publication_date || '',
        officer_in_charge: batchFormData?.officer_in_charge || '',
        handbook_committee: batchFormData?.handbook_committee || '',
        dissemination_orientation: batchFormData?.dissemination_orientation || false,
        orientation_dates: batchFormData?.orientation_dates || '',
        mode_of_delivery: batchFormData?.mode_of_delivery || '',
        dissemination_uploaded: batchFormData?.dissemination_uploaded || false,
        dissemination_others: batchFormData?.dissemination_others || false,
        dissemination_others_text: batchFormData?.dissemination_others_text || '',
        type_digital: batchFormData?.type_digital || false,
        type_printed: batchFormData?.type_printed || false,
        type_others: batchFormData?.type_others || false,
        type_others_text: batchFormData?.type_others_text || '',
        has_academic_policies: batchFormData?.has_academic_policies || false,
        has_admission_requirements: batchFormData?.has_admission_requirements || false,
        has_code_of_conduct: batchFormData?.has_code_of_conduct || false,
        has_scholarships: batchFormData?.has_scholarships || false,
        has_student_publication: batchFormData?.has_student_publication || false,
        has_housing_services: batchFormData?.has_housing_services || false,
        has_disability_services: batchFormData?.has_disability_services || false,
        has_student_council: batchFormData?.has_student_council || false,
        has_refund_policies: batchFormData?.has_refund_policies || false,
        has_drug_education: batchFormData?.has_drug_education || false,
        has_foreign_students: batchFormData?.has_foreign_students || false,
        has_disaster_management: batchFormData?.has_disaster_management || false,
        has_safe_spaces: batchFormData?.has_safe_spaces || false,
        has_anti_hazing: batchFormData?.has_anti_hazing || false,
        has_anti_bullying: batchFormData?.has_anti_bullying || false,
        has_violence_against_women: batchFormData?.has_violence_against_women || false,
        has_gender_fair: batchFormData?.has_gender_fair || false,
        has_others: batchFormData?.has_others || false,
        has_others_text: batchFormData?.has_others_text || '',
      });
    } else {
      // Reset form to empty state
      setData({
        version_publication_date: '',
        officer_in_charge: '',
        handbook_committee: '',
        dissemination_orientation: false,
        orientation_dates: '',
        mode_of_delivery: '',
        dissemination_uploaded: false,
        dissemination_others: false,
        dissemination_others_text: '',
        type_digital: false,
        type_printed: false,
        type_others: false,
        type_others_text: '',
        has_academic_policies: false,
        has_admission_requirements: false,
        has_code_of_conduct: false,
        has_scholarships: false,
        has_student_publication: false,
        has_housing_services: false,
        has_disability_services: false,
        has_student_council: false,
        has_refund_policies: false,
        has_drug_education: false,
        has_foreign_students: false,
        has_disaster_management: false,
        has_safe_spaces: false,
        has_anti_hazing: false,
        has_anti_bullying: false,
        has_violence_against_women: false,
        has_gender_fair: false,
        has_others: false,
        has_others_text: '',
      });
    }
  }, [selectedYear, existingBatches]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    router.post('/hei/annex-d', {
      academic_year: academicYear,
      ...data,
      request_notes: requestNotes
    }, {
      onFinish: () => setProcessing(false)
    });
  };

  return (
    <HEILayout title="Submit Annex D">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              UPDATES ON STUDENT HANDBOOK/MANUAL
            </h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              Annex D
            </span>
          </div>
        </div>

        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AcademicYearSelect
              value={academicYear}
              onChange={(e) => {
                const year = e.target.value;
                setAcademicYear(year);
                setSelectedYear(year);
              }}
              availableYears={availableYears}
              required
            />
            <FormSelector 
              currentForm="D"
              options={formOptions}
              mode="navigate"
              getRoute={getFormRoute}
              confirmBeforeChange={true}
              label="Form Type"
            />
          </div>
        )}
        {isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Academic Year:</strong> {academicYear}
            </p>
          </div>
        )}

        <InfoBox
          type={getSubmissionStatusMessage(existingBatch).type}
          message={getSubmissionStatusMessage(existingBatch).message}
        />

        <form onSubmit={handleSubmit} className="relative space-y-6">
        <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Version/ Publication date
                </label>
                <input
                  type="text"
                  value={data.version_publication_date}
                  onChange={(e) => setData({ ...data, version_publication_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Second Revision 2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Officer-in-Charge
                </label>
                <input
                  type="text"
                  value={data.officer_in_charge}
                  onChange={(e) => setData({ ...data, officer_in_charge: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dean of Students Affair"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Composition of the Student Handbook Committee
                </label>
                <textarea
                  value={data.handbook_committee}
                  onChange={(e) => setData({ ...data, handbook_committee: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="List committee members..."
                />
              </div>
            </div>
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mode of Dissemination */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mode of Dissemination</h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.dissemination_orientation}
                      onChange={(e) => setData({ ...data, dissemination_orientation: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">Orientation</span>
                  </label>

                  {data.dissemination_orientation && (
                    <div className="ml-8 mt-3 space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Date/s of Orientation
                        </label>
                        <input
                          type="text"
                          value={data.orientation_dates}
                          onChange={(e) => setData({ ...data, orientation_dates: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          placeholder="Enter dates"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Mode of delivery (F2F/online or both)
                        </label>
                        <input
                          type="text"
                          value={data.mode_of_delivery}
                          onChange={(e) => setData({ ...data, mode_of_delivery: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          placeholder="e.g., F2F, Online, Both"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={data.dissemination_uploaded}
                    onChange={(e) => setData({ ...data, dissemination_uploaded: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">Uploaded in Website</span>
                </label>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.dissemination_others}
                      onChange={(e) => setData({ ...data, dissemination_others: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">Others, please specify</span>
                  </label>

                  {data.dissemination_others && (
                    <input
                      type="text"
                      value={data.dissemination_others_text}
                      onChange={(e) => setData({ ...data, dissemination_others_text: e.target.value })}
                      className="ml-8 mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="Specify other dissemination mode"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Type of Handbook */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Type of Student Handbook/Manual</h2>

              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={data.type_digital}
                    onChange={(e) => setData({ ...data, type_digital: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">Digital Copy</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={data.type_printed}
                    onChange={(e) => setData({ ...data, type_printed: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">Printed</span>
                </label>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.type_others}
                      onChange={(e) => setData({ ...data, type_others: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">Others, please specify</span>
                  </label>

                  {data.type_others && (
                    <input
                      type="text"
                      value={data.type_others_text}
                      onChange={(e) => setData({ ...data, type_others_text: e.target.value })}
                      className="ml-8 mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="Specify other type"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contains the following information (check all applicable items/information)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_academic_policies}
                  onChange={(e) => setData({ ...data, has_academic_policies: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Academic and Institutional Policies</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_admission_requirements}
                  onChange={(e) => setData({ ...data, has_admission_requirements: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Admission requirements</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_code_of_conduct}
                  onChange={(e) => setData({ ...data, has_code_of_conduct: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Student Code of Conduct and Discipline</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_scholarships}
                  onChange={(e) => setData({ ...data, has_scholarships: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Scholarships/Financial Assistance</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_student_publication}
                  onChange={(e) => setData({ ...data, has_student_publication: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Student Publication</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_housing_services}
                  onChange={(e) => setData({ ...data, has_housing_services: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Housing Services/Dormitories (if applicable)</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_disability_services}
                  onChange={(e) => setData({ ...data, has_disability_services: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Services for Learners with Disabilities and Special Needs</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_student_council}
                  onChange={(e) => setData({ ...data, has_student_council: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Student Council/Government/Organizations</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_refund_policies}
                  onChange={(e) => setData({ ...data, has_refund_policies: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Refund policies</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_drug_education}
                  onChange={(e) => setData({ ...data, has_drug_education: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Drug Education, prevention and control</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_foreign_students}
                  onChange={(e) => setData({ ...data, has_foreign_students: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Foreign students (if applicable)</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_disaster_management}
                  onChange={(e) => setData({ ...data, has_disaster_management: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Disaster Risk Reduction and Management</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_safe_spaces}
                  onChange={(e) => setData({ ...data, has_safe_spaces: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Safe Spaces Act</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_anti_hazing}
                  onChange={(e) => setData({ ...data, has_anti_hazing: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Anti-Hazing Act</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_anti_bullying}
                  onChange={(e) => setData({ ...data, has_anti_bullying: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Anti-Bullying Act</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_violence_against_women}
                  onChange={(e) => setData({ ...data, has_violence_against_women: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Violence against women and their children</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.has_gender_fair}
                  onChange={(e) => setData({ ...data, has_gender_fair: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">Gender-fair education</span>
              </label>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={data.has_others}
                    onChange={(e) => setData({ ...data, has_others: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">Others, please specify</span>
                </label>

                {data.has_others && (
                  <input
                    type="text"
                    value={data.has_others_text}
                    onChange={(e) => setData({ ...data, has_others_text: e.target.value })}
                    className="ml-8 mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Specify other information"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Request Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Additional Notes (Optional)
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes for this submission
              </label>
              <textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Optional: Any notes for this submission (max 1000 characters)"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {requestNotes.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <IoSave size={20} />
              {processing ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
        </form>
      </div>
    </HEILayout>
  );
};

export default Create;
