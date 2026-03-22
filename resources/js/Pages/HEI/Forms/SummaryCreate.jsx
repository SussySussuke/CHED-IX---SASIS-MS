import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import HEILayout from '../../../Layouts/HEILayout';
import TextInput from '../../../Components/Forms/TextInput';
import MultiTextInput from '../../../Components/Forms/MultiTextInput';
import FormSection from '../../../Components/Common/FormSection';
import AdditionalNotesSection from '../../../Components/Annex/AdditionalNotesSection';
import InfoBox from '../../../Components/Widgets/InfoBox';
import AcademicYearSelect from '../../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../../Components/Forms/FormSelector';
import { buildFormOptionsGrouped } from '../../../Config/formConfig';
import { getFormRoute } from '../../../Config/nonAnnexForms';
import { getSubmissionStatusMessage } from '../../../Utils/submissionStatus';
import { getAcademicYearFromUrl } from '../../../Utils/urlHelpers';
import { useTheme } from '../../../Context/ThemeContext';
import { IoSave } from 'react-icons/io5';

// social_media_contacts may come from the server as a JSON string, a plain
// string, null, or already an array. Always normalize to a non-empty array.
const toContactsArray = (val) => {
  if (Array.isArray(val) && val.length > 0) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    try { const p = JSON.parse(val); return Array.isArray(p) && p.length > 0 ? p : ['']; } catch { return [val]; }
  }
  return [''];
};

const Create = ({ availableYears = [], existingSubmissions = {}, defaultYear, isEditing = false }) => {
  const currentAcademicYear = getAcademicYearFromUrl(defaultYear);
  const formOptions = buildFormOptionsGrouped();
  const { isDark } = useTheme();
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
    social_media_contacts: toContactsArray(submission?.social_media_contacts),
    student_handbook: submission?.student_handbook || '',
    student_publication: submission?.student_publication || '',
    request_notes: '',
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
        social_media_contacts: toContactsArray(yearSubmission.social_media_contacts),
        student_handbook: yearSubmission.student_handbook || '',
        student_publication: yearSubmission.student_publication || '',
        request_notes: '',
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
        request_notes: '',
      });
    }
  }, [selectedYear, existingSubmissions]);

  useEffect(() => {
    const male = parseInt(data.population_male) || 0;
    const female = parseInt(data.population_female) || 0;
    const intersex = parseInt(data.population_intersex) || 0;
    setData('population_total', male + female + intersex);
  }, [data.population_male, data.population_female, data.population_intersex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/hei/summary');
  };

  const statusMessage = getSubmissionStatusMessage(existingSubmission);

  return (
    <HEILayout title={isEditing ? 'Edit Summary' : 'Submit Summary'}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Summary' : 'Submit Summary'}
          </h1>
          <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
            SUMMARY
          </span>
        </div>

        {/* Year + Form selectors — hidden when editing */}
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

        {/* Locked year banner — only when editing */}
        {isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Academic Year:</strong> {data.academic_year}
            </p>
          </div>
        )}

        {/* Status info box */}
        <InfoBox type={statusMessage.type} message={statusMessage.message} />

        {/* Main form card */}
        <form onSubmit={handleSubmit}>
          <div className={`relative rounded-lg shadow p-6 border space-y-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

            {/* Student Population */}
            <FormSection
              title="Student Population (First Semester)"
              subtitle="Total enrollment count for the first semester of the selected academic year."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Male <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="population_male"
                    value={data.population_male}
                    onChange={(e) => setData('population_male', e.target.value)}
                    required
                    min="0"
                    placeholder="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                  {errors.population_male && <p className="mt-1 text-sm text-red-500">{errors.population_male}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Female <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="population_female"
                    value={data.population_female}
                    onChange={(e) => setData('population_female', e.target.value)}
                    required
                    min="0"
                    placeholder="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                  {errors.population_female && <p className="mt-1 text-sm text-red-500">{errors.population_female}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Intersex <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="population_intersex"
                    value={data.population_intersex}
                    onChange={(e) => setData('population_intersex', e.target.value)}
                    required
                    min="0"
                    placeholder="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                  {errors.population_intersex && <p className="mt-1 text-sm text-red-500">{errors.population_intersex}</p>}
                </div>
              </div>

              {/* Auto-calculated total */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Population (auto-calculated)
                </span>
                <span className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {(data.population_total || 0).toLocaleString()}
                </span>
              </div>
            </FormSection>

            {/* Organizational Information */}
            <FormSection
              title="Organizational Information"
              subtitle="Link to the institution's organizational chart or structure document."
            >
              <TextInput
                label="Organization Chart / Structure (Google Drive link)"
                name="submitted_org_chart"
                type="url"
                value={data.submitted_org_chart}
                onChange={(e) => setData('submitted_org_chart', e.target.value)}
                error={errors.submitted_org_chart}
                placeholder="https://drive.google.com/..."
              />
            </FormSection>

            {/* Contact Information */}
            <FormSection
              title="Contact Information"
              subtitle="Official websites and social media channels for the institution."
            >
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
                label="Social Media / Email Contacts"
                name="social_media_contacts"
                values={data.social_media_contacts}
                onChange={(values) => setData('social_media_contacts', values)}
                error={errors.social_media_contacts}
                placeholder="e.g., facebook.com/yourpage, contact@example.edu.ph"
              />
            </FormSection>

            {/* Student Resources */}
            <FormSection
              title="Student Resources"
              subtitle="Current edition of the student handbook and the title of the official student publication."
            >
              <TextInput
                label="Student Handbook / Manual Edition or Date"
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
            </FormSection>

            {/* Submit button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={processing}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${processing ? 'bg-gray-400 cursor-not-allowed text-white' : isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                <IoSave size={20} />
                {processing ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Submission'}
              </button>
            </div>
          </div>
        </form>

        {/* Request notes — separate card, only shown when editing (matches AdditionalNotesSection pattern) */}
        {isEditing && (
          <AdditionalNotesSection
            value={data.request_notes}
            onChange={(val) => setData('request_notes', val)}
          />
        )}

      </div>
    </HEILayout>
  );
};

export default Create;
