import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import HEILayout from '../../../Layouts/HEILayout';
import TextInput from '../../../Components/Forms/TextInput';
import SelectInput from '../../../Components/Forms/SelectInput';
import MultiTextInput from '../../../Components/Forms/MultiTextInput';
import InfoBox from '../../../Components/Widgets/InfoBox';
import AcademicYearSelect from '../../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../../Components/Forms/FormSelector';
import { buildFormOptionsGrouped } from '../../../Config/formConfig';
import { getFormRoute } from '../../../Config/nonAnnexForms';
import { CURRENT_YEAR } from '../../../Utils/constants';
import { getSubmissionStatusMessage } from '../../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../../Utils/urlHelpers';
import { IoPeople, IoMale, IoFemale, IoMaleFemale, IoCalculator, IoDocumentText, IoGlobe, IoBook } from 'react-icons/io5';

const Create = ({ availableYears = [], existingSubmissions = {}, defaultYear, isEditing = false }) => {
  const currentAcademicYear = getAcademicYearFromUrl(defaultYear);
  const formOptions = buildFormOptionsGrouped();
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);

  const existingSubmission = existingSubmissions[selectedYear];

  const submission = existingSubmission || {};

  const { data, setData, post, processing, errors } = useForm({
    academic_year: selectedYear,
    population_male: submission?.population_male || '',
    population_female: submission?.population_female || '',
    population_intersex: submission?.population_intersex || '',
    population_total: submission?.population_total || 0,
    submitted_org_chart: submission?.submitted_org_chart || '',
    hei_website: submission?.hei_website || '',
    sas_website: submission?.sas_website || '',
    social_media_contacts: submission?.social_media_contacts || [''],
    student_handbook: submission?.student_handbook || '',
    student_publication: submission?.student_publication || '',
    request_notes: ''
  });

  useEffect(() => {
    const yearSubmission = existingSubmissions[selectedYear];
    if (yearSubmission) {
      setData({
        academic_year: selectedYear,
        population_male: yearSubmission.population_male || '',
        population_female: yearSubmission.population_female || '',
        population_intersex: yearSubmission.population_intersex || '',
        population_total: yearSubmission.population_total || 0,
        submitted_org_chart: yearSubmission.submitted_org_chart || '',
        hei_website: yearSubmission.hei_website || '',
        sas_website: yearSubmission.sas_website || '',
        social_media_contacts: yearSubmission.social_media_contacts || [''],
        student_handbook: yearSubmission.student_handbook || '',
        student_publication: yearSubmission.student_publication || '',
        request_notes: ''
      });
    } else {
      setData({
        academic_year: selectedYear,
        population_male: '',
        population_female: '',
        population_intersex: '',
        population_total: 0,
        submitted_org_chart: '',
        hei_website: '',
        sas_website: '',
        social_media_contacts: [''],
        student_handbook: '',
        student_publication: '',
        request_notes: ''
      });
    }
  }, [selectedYear, existingSubmissions]);

  useEffect(() => {
    const male = parseInt(data.population_male) || 0;
    const female = parseInt(data.population_female) || 0;
    const intersex = parseInt(data.population_intersex) || 0;
    const total = male + female + intersex;
    setData('population_total', total);
  }, [data.population_male, data.population_female, data.population_intersex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/hei/summary');
  };

  const statusMessage = getSubmissionStatusMessage(existingSubmission);

  return (
    <HEILayout title={isEditing ? "Edit Summary" : "Submit Summary"}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Summary' : 'Submit Summary'}
            </h1>
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              SUMMARY
            </span>
          </div>
        </div>

        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AcademicYearSelect
              value={data.academic_year}
              onChange={(e) => {
                const year = e.target.value;
                setData('academic_year', year);
                setSelectedYear(year);
              }}
              availableYears={availableYears}
              error={errors.academic_year}
              required
            />
            <FormSelector 
              currentForm="SUMMARY"
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
              <strong>Academic Year:</strong> {data.academic_year}
            </p>
          </div>
        )}

        <InfoBox
          type={statusMessage.type}
          message={statusMessage.message}
        />

        <form onSubmit={handleSubmit} className="relative space-y-6">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 space-y-8">

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-500 dark:border-blue-400">
                <IoPeople className="text-2xl text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Student Population (First Semester)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <IoMale className="text-xl text-blue-500" />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Male <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    name="population_male"
                    value={data.population_male}
                    onChange={(e) => setData('population_male', e.target.value)}
                    required
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-blue-300 dark:border-blue-600"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <IoFemale className="text-xl text-pink-500" />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Female <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    name="population_female"
                    value={data.population_female}
                    onChange={(e) => setData('population_female', e.target.value)}
                    required
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 border-pink-300 dark:border-pink-600"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <IoMaleFemale className="text-xl text-purple-500" />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Intersex <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    name="population_intersex"
                    value={data.population_intersex}
                    onChange={(e) => setData('population_intersex', e.target.value)}
                    required
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 border-purple-300 dark:border-purple-600"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-900/20 dark:to-pink-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoCalculator className="text-2xl text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Population</span>
                  </div>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {data.population_total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-green-500 dark:border-green-400">
                <IoDocumentText className="text-2xl text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Organizational Information
                </h2>
              </div>

              <SelectInput
                label="Submitted Organization Chart/Structure"
                name="submitted_org_chart"
                value={data.submitted_org_chart}
                onChange={(e) => setData('submitted_org_chart', e.target.value)}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' }
                ]}
                error={errors.submitted_org_chart}
                required
                placeholder="Select an option"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-purple-500 dark:border-purple-400">
                <IoGlobe className="text-2xl text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h2>
              </div>

              <TextInput
                label="HEI Website"
                name="hei_website"
                type="url"
                value={data.hei_website}
                onChange={(e) => setData('hei_website', e.target.value)}
                error={errors.hei_website}
                placeholder="https://example.edu.ph"
              />

              <TextInput
                label="SAS Website"
                name="sas_website"
                type="url"
                value={data.sas_website}
                onChange={(e) => setData('sas_website', e.target.value)}
                error={errors.sas_website}
                placeholder="https://sas.example.edu.ph (if applicable)"
              />

              <MultiTextInput
                label="Social Media/Email Contacts"
                name="social_media_contacts"
                values={data.social_media_contacts}
                onChange={(values) => setData('social_media_contacts', values)}
                error={errors.social_media_contacts}
                placeholder="e.g., facebook.com/yourpage, contact@example.edu.ph"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-orange-500 dark:border-orange-400">
                <IoBook className="text-2xl text-orange-600 dark:text-orange-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Student Resources
                </h2>
              </div>

              <TextInput
                label="Student Handbook/Manual Edition/Date"
                name="student_handbook"
                type="text"
                value={data.student_handbook}
                onChange={(e) => setData('student_handbook', e.target.value)}
                error={errors.student_handbook}
                placeholder="e.g., 2026 Edition, January 2026"
              />

              <TextInput
                label="Title of Student Publication"
                name="student_publication"
                type="text"
                value={data.student_publication}
                onChange={(e) => setData('student_publication', e.target.value)}
                error={errors.student_publication}
                placeholder="e.g., The Campus Herald"
              />
            </div>

            {isEditing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-500 dark:border-blue-400">
                  <IoDocumentText className="text-2xl text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Request Notes (Optional)
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes for this update request
                  </label>
                  <textarea
                    name="request_notes"
                    value={data.request_notes}
                    onChange={(e) => setData('request_notes', e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional: Provide context or reasons for this update request"
                  />
                  {errors.request_notes && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.request_notes}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {data.request_notes.length}/1000 characters
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Submitting...' : (isEditing ? 'Request Update' : 'Submit Information')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </HEILayout>
  );
};

export default Create;
