import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { formatDateTime } from '../../Utils/formatters';
import { IoChevronDown, IoChevronUp, IoEye, IoCheckmarkCircle, IoCreate } from 'react-icons/io5';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { getAnnexConfig, ANNEX_CONFIG, ANNEX_NAMES } from '../../Config/formConfig';
import { useDarkMode } from '../../Hooks/useDarkMode';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../Utils/hotTableStyles';
import EmptyState from '../Common/EmptyState';

registerAllModules();

export default function SubmissionsList({
    mode = 'hei', // 'hei' or 'admin'
    submissions,
    academicYears,
    selectedAnnex,
    fetchDataUrl, // URL pattern for fetching batch data
    onApprove, // Admin only
    onReject, // Admin only
    onCancel, // HEI only
    showCreateButton = false,
    createButtonUrl
}) {
    // Get persisted annex from sessionStorage or use selectedAnnex prop
    const getPersistedAnnex = () => {
        if (mode === 'hei') {
            const stored = sessionStorage.getItem('selectedAnnex');
            return stored || selectedAnnex || 'A';
        }
        return selectedAnnex || 'all';
    };

    const [filterStatus, setFilterStatus] = useState('all');
    const [filterYear, setFilterYear] = useState('');
    const [filterAnnex, setFilterAnnex] = useState(getPersistedAnnex());
    const [expandedBatches, setExpandedBatches] = useState({});
    const [batchData, setBatchData] = useState({});
    const [loadingBatch, setLoadingBatch] = useState(null);
    const [compareModal, setCompareModal] = useState(null);
    const isDark = useDarkMode();

    const statusColors = {
        draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
        submitted: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
        published: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
        request: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
        overwritten: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
        rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
    };

    // Build annex options from available data
    const annexOptions = mode === 'admin'
        ? (() => {
            // Admin: Extract unique annexes from submissions
            const uniqueAnnexes = [...new Set(submissions.map(s => s.annex))];
            // Separate SUMMARY from other annexes
            const hasSummary = uniqueAnnexes.includes('SUMMARY');
            const otherAnnexes = uniqueAnnexes.filter(a => a !== 'SUMMARY').sort();
            // Return SUMMARY first (if it exists), then others alphabetically
            return hasSummary ? ['SUMMARY', ...otherAnnexes] : otherAnnexes;
        })()
        : (() => {
            // HEI: Build from ANNEX_NAMES (which has ALL annexes A-O)
            const standardAnnexes = Object.keys(ANNEX_NAMES).sort();
            return ['SUMMARY', ...standardAnnexes];  // Always include SUMMARY first
        })();

    const filteredSubmissions = submissions.filter(sub => {
        if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
        if (filterYear && !sub.academic_year.includes(filterYear)) return false;
        if (filterAnnex !== 'all' && sub.annex !== filterAnnex) return false;
        return true;
    });

    const toggleBatch = async (batchId, annex) => {
        const key = `${annex}-${batchId}`;

        if (expandedBatches[key]) {
            setExpandedBatches(prev => ({ ...prev, [key]: false }));
        } else {
            setExpandedBatches(prev => ({ ...prev, [key]: true }));

            if (!batchData[key]) {
                setLoadingBatch(key);
                try {
                    const url = fetchDataUrl.replace(':annex', annex).replace(':batchId', batchId);
                    const response = await fetch(url);
                    const data = await response.json();
                    setBatchData(prev => ({ ...prev, [key]: data }));
                } catch (error) {
                    console.error('Failed to fetch batch data:', error);
                } finally {
                    setLoadingBatch(null);
                }
            }
        }
    };

    const openCompareModal = async (submission) => {
        const publishedBatch = submissions.find(
            s => s.annex === submission.annex &&
                 s.academic_year === submission.academic_year &&
                 s.status === 'published'
        );

        if (!publishedBatch) {
            alert('No published batch found to compare with.');
            return;
        }

        setCompareModal({ loading: true });
        try {
            const url1 = fetchDataUrl.replace(':annex', submission.annex).replace(':batchId', submission.batch_id);
            const url2 = fetchDataUrl.replace(':annex', publishedBatch.annex).replace(':batchId', publishedBatch.batch_id);

            const [newResponse, oldResponse] = await Promise.all([
                fetch(url1),
                fetch(url2)
            ]);

            const newData = await newResponse.json();
            const oldData = await oldResponse.json();

            setCompareModal({
                loading: false,
                newBatch: { ...submission, data: newData },
                oldBatch: { ...publishedBatch, data: oldData }
            });
        } catch (error) {
            console.error('Failed to fetch comparison data:', error);
            setCompareModal(null);
        }
    };

    const handleAnnexChange = (newAnnex) => {
        if (mode === 'hei') {
            setFilterAnnex(newAnnex);
            sessionStorage.setItem('selectedAnnex', newAnnex);
            router.get('/hei/submissions/history', { annex: newAnnex }, {
                preserveState: true,
                preserveScroll: true
            });
        } else {
            setFilterAnnex(newAnnex);
        }
    };

    // Render functions for different annex types (D, G, H, M)
    const renderAnnexD = (data) => {
        const submission = data.submission || data.batch;
        if (!submission) {
            return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;
        }

        return (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 text-sm border border-gray-300 dark:border-gray-600">
                                      <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                          <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Field</th>
                                          <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Value</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                          <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">BASIC INFORMATION</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">version_publication_date</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.version_publication_date || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">officer_in_charge</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.officer_in_charge || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">handbook_committee</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.handbook_committee || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
            
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                          <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">MODE OF DISSEMINATION</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_orientation</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_orientation ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">orientation_dates</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.orientation_dates || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">mode_of_delivery</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.mode_of_delivery || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_uploaded</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_uploaded ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_others</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_others ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_others_text</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_others_text || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
            
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                          <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">TYPE OF HANDBOOK/MANUAL</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_digital</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_digital ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_printed</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_printed ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_others</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_others ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_others_text</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_others_text || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
            
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                          <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">CHECKLIST</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_academic_policies</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_academic_policies ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_admission_requirements</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_admission_requirements ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_code_of_conduct</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_code_of_conduct ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_scholarships</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_scholarships ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_student_publication</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_student_publication ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_housing_services</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_housing_services ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_disability_services</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_disability_services ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_student_council</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_student_council ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_refund_policies</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_refund_policies ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_drug_education</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_drug_education ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_foreign_students</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_foreign_students ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_disaster_management</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_disaster_management ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_safe_spaces</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_safe_spaces ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_anti_hazing</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_anti_hazing ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_anti_bullying</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_anti_bullying ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_violence_against_women</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_violence_against_women ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_gender_fair</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_gender_fair ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_others</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_others ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                                        </tr>
                                        <tr>
                                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_others_text</td>
                                          <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_others_text || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
        );
    };

    const renderAnnexG = (data) => {
        const formData = data.form_data;
        const editorialBoards = data.editorial_boards || [];
        const otherPublications = data.other_publications || [];
        const programs = data.programs || [];

        const editorialBoardColumns = [
            { data: 'name', title: 'Name', type: 'text', readOnly: true, width: 200 },
            { data: 'position_in_editorial_board', title: 'Position', type: 'text', readOnly: true, width: 200 },
            { data: 'degree_program_year_level', title: 'Degree Program & Year', type: 'text', readOnly: true, width: 250 }
        ];

        return (
            <div className="space-y-4">
                {formData && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Publication Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {formData.official_school_name && (
                                <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">School Name:</span>
                                    <p className="text-gray-900 dark:text-white">{formData.official_school_name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {editorialBoards.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Editorial Board Members</h3>
                        <div className="overflow-auto">
                            <HotTable
                                data={editorialBoards}
                                colHeaders={true}
                                rowHeaders={true}
                                columns={editorialBoardColumns}
                                height="auto"
                                licenseKey="non-commercial-and-evaluation"
                                stretchH="all"
                                className={isDark ? 'dark-table' : ''}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderAnnexH = (data) => {
        const admissionServices = data.admission_services || [];
        const admissionStatistics = data.admission_statistics || [];

        const servicesColumns = [
            { data: 'service_type', title: 'Service Type', type: 'text', readOnly: true, width: 250 },
            { data: 'with', title: 'Available', type: 'checkbox', readOnly: true, width: 100, className: 'htCenter htMiddle' },
            { data: 'supporting_documents', title: 'Supporting Documents', type: 'text', readOnly: true, width: 200 },
            { data: 'remarks', title: 'Remarks', type: 'text', readOnly: true, width: 200 }
        ];

        const statisticsColumns = [
            { data: 'program', title: 'Program', type: 'text', readOnly: true, width: 250 },
            { data: 'applicants', title: 'Applicants', type: 'numeric', readOnly: true, width: 120 },
            { data: 'admitted', title: 'Admitted', type: 'numeric', readOnly: true, width: 120 },
            { data: 'enrolled', title: 'Enrolled', type: 'numeric', readOnly: true, width: 120 }
        ];

        return (
            <div className="space-y-6">
                {admissionServices.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Admission Services ({admissionServices.length} entries)</h3>
                        <div className="overflow-auto">
                            <HotTable
                                data={admissionServices}
                                colHeaders={true}
                                rowHeaders={true}
                                columns={servicesColumns}
                                height="auto"
                                licenseKey="non-commercial-and-evaluation"
                                stretchH="all"
                                className={isDark ? 'dark-table' : ''}
                            />
                        </div>
                    </div>
                )}
                {admissionStatistics.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Admission Statistics ({admissionStatistics.length} entries)</h3>
                        <div className="overflow-auto">
                            <HotTable
                                data={admissionStatistics}
                                colHeaders={true}
                                rowHeaders={true}
                                columns={statisticsColumns}
                                height="auto"
                                licenseKey="non-commercial-and-evaluation"
                                stretchH="all"
                                className={isDark ? 'dark-table' : ''}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderAnnexM = (data) => {
        const statistics = data.statistics || [];
        const services = data.services || [];

        // Extract years from year_data - collect all unique years from all statistics
        let years = [];
        if (statistics.length > 0) {
            const yearSet = new Set();
            
            statistics.forEach(stat => {
                let yearData = stat.year_data;
                
                // If year_data is a string, parse it
                if (typeof yearData === 'string') {
                    try {
                        yearData = JSON.parse(yearData);
                    } catch (e) {
                        console.error('Failed to parse year_data:', e);
                        return;
                    }
                }
                
                // Collect all year keys
                if (yearData && typeof yearData === 'object' && !Array.isArray(yearData)) {
                    Object.keys(yearData).forEach(year => yearSet.add(year));
                }
            });
            
            years = Array.from(yearSet).sort();
        }

        // Group services by section
        const SECTIONS = [
            'A. Persons with Disabilities',
            'B. Indigenous People',
            'C. Dependents of Solo Parents / Solo Parents',
            'D. Other students with special needs',
        ];
        const servicesBySection = {};
        SECTIONS.forEach(section => {
            servicesBySection[section] = services.filter(s => s.section === section);
        });

        // Helper function to parse year_data if needed
        const getYearData = (row) => {
            let yearData = row.year_data;
            if (typeof yearData === 'string') {
                try {
                    yearData = JSON.parse(yearData);
                } catch (e) {
                    return {};
                }
            }
            return yearData || {};
        };

        // Helper function to calculate totals
        const getTotalEnrollment = (row) => {
            const yearData = getYearData(row);
            return years.reduce((sum, year) =>
                sum + (parseInt(yearData[year]?.enrollment) || 0), 0);
        };

        const getTotalGraduates = (row) => {
            const yearData = getYearData(row);
            return years.reduce((sum, year) =>
                sum + (parseInt(yearData[year]?.graduates) || 0), 0);
        };

        // Render statistics as a custom HTML table (similar to create form)
        const renderStatisticsTable = () => {
            let currentCategory = null;
            let categoryRowCount = 0;
            const categoryStartIndices = {};

            // Calculate category row counts for rowspan
            statistics.forEach((row, index) => {
                if (row.category !== currentCategory) {
                    if (currentCategory !== null) {
                        categoryStartIndices[currentCategory] = { start: index - categoryRowCount, count: categoryRowCount };
                    }
                    currentCategory = row.category;
                    categoryRowCount = 1;
                } else {
                    categoryRowCount++;
                }
            });
            if (currentCategory !== null) {
                categoryStartIndices[currentCategory] = { start: statistics.length - categoryRowCount, count: categoryRowCount };
            }

            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Category</th>
                                <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Subcategory</th>
                                {years.map(year => (
                                    <th key={year} colSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">
                                        AY {year}
                                    </th>
                                ))}
                                <th colSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Total</th>
                            </tr>
                            <tr>
                                {years.map(year => (
                                    <React.Fragment key={year}>
                                        <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Enroll</th>
                                        <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Grad</th>
                                    </React.Fragment>
                                ))}
                                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Enroll</th>
                                <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Grad</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {statistics.map((row, index) => {
                                const isFirstInCategory = index === 0 || statistics[index - 1].category !== row.category;
                                const categoryInfo = categoryStartIndices[row.category];
                                const rowspan = isFirstInCategory ? categoryInfo.count : 0;
                                const isReadOnly = row.is_subtotal || row.category === 'TOTAL';
                                const bgClass = isReadOnly ? 'bg-gray-100 dark:bg-gray-700/50 font-semibold' : 'bg-white dark:bg-gray-800';

                                return (
                                    <tr key={index} className={bgClass}>
                                        {isFirstInCategory && (
                                            <td rowSpan={rowspan} className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 align-top">
                                                {row.category}
                                            </td>
                                        )}
                                        <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                            {row.subcategory || (row.category === 'TOTAL' ? 'TOTAL' : '')}
                                        </td>
                                        {years.map(year => {
                                            const yearData = getYearData(row);
                                            return (
                                                <React.Fragment key={year}>
                                                    <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                                        {yearData[year]?.enrollment ?? 0}
                                                    </td>
                                                    <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                                        {yearData[year]?.graduates ?? 0}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                        <td className="px-2 py-2 text-sm text-center font-semibold border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                            {getTotalEnrollment(row)}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-center font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                            {getTotalGraduates(row)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        };

        // Render services table for a section
        const renderServicesTable = (section) => {
            const sectionServices = servicesBySection[section] || [];
            
            if (sectionServices.length === 0) {
                return (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic ml-4">No services for this section.</p>
                );
            }

            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Category</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Institutional Services/Programs/Activities</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">No. of Beneficiaries/Participants</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sectionServices.map((service, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                        {service.category || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                        {service.institutional_services_programs_activities}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                        {service.number_of_beneficiaries_participants?.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                        {service.remarks || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        };

        return (
            <div className="space-y-6">
                {statistics.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Table 1: Statistics</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Enrollment and graduate statistics across the last three academic years.
                        </p>
                        {renderStatisticsTable()}
                    </div>
                )}
                {services.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Table 2: Services</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Institutional services, programs, and activities for each category of students with special needs.
                        </p>
                        <div className="space-y-4">
                            {SECTIONS.map(section => (
                                <div key={section}>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{section}</h4>
                                    {renderServicesTable(section)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render function for SUMMARY
    const renderSummary = (data) => {
        const info = data.summary;
        if (!info) return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;

        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Academic Year:</span>
                        <p className="text-gray-900 dark:text-white">{info.academic_year}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <p className="text-gray-900 dark:text-white capitalize">{info.status}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Male Population:</span>
                        <p className="text-gray-900 dark:text-white">{info.population_male?.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Female Population:</span>
                        <p className="text-gray-900 dark:text-white">{info.population_female?.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Intersex Population:</span>
                        <p className="text-gray-900 dark:text-white">{info.population_intersex?.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Total Population:</span>
                        <p className="text-gray-900 dark:text-white">{info.population_total?.toLocaleString()}</p>
                    </div>
                    {info.hei_website && (
                        <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">HEI Website:</span>
                            <p className="text-gray-900 dark:text-white break-all">{info.hei_website}</p>
                        </div>
                    )}
                    {info.sas_website && (
                        <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">SAS Website:</span>
                            <p className="text-gray-900 dark:text-white break-all">{info.sas_website}</p>
                        </div>
                    )}
                    {info.student_handbook && (
                        <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Student Handbook:</span>
                            <p className="text-gray-900 dark:text-white">{info.student_handbook}</p>
                        </div>
                    )}
                    {info.student_publication && (
                        <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Student Publication:</span>
                            <p className="text-gray-900 dark:text-white">{info.student_publication}</p>
                        </div>
                    )}
                </div>
                {info.social_media_contacts && info.social_media_contacts.length > 0 && (
                    <div className="mt-4">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Social Media Contacts:</span>
                        <ul className="list-disc list-inside text-gray-900 dark:text-white mt-1">
                            {info.social_media_contacts.map((contact, idx) => (
                                <li key={idx} className="break-all">{contact}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderBatchContent = (annex, data) => {
        // Handle SUMMARY first
        if (annex === 'SUMMARY') return renderSummary(data);
        
        // Handle special annex types with custom renderers
        if (annex === 'D') return renderAnnexD(data);
        if (annex === 'G') return renderAnnexG(data);
        if (annex === 'H') return renderAnnexH(data);
        if (annex === 'M') return renderAnnexM(data);

        if (!ANNEX_CONFIG[annex]) {
            return <p className="text-gray-500 dark:text-gray-400">Loading...</p>;
        }

        const config = getAnnexConfig(annex);
        const entities = data.entities || [];

        if (entities.length === 0) {
            return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;
        }

        const columns = config.columns.map(col => ({
            ...col,
            readOnly: true,
            width: col.width * 0.8
        }));

        return (
            <div>
                <HotTable
                    data={entities.map(config.dataMapper)}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={true}
                    height="auto"
                    licenseKey="non-commercial-and-evaluation"
                    readOnly={true}
                    stretchH="all"
                    className={isDark ? 'dark-table' : ''}
                />
            </div>
        );
    };

    const hasAnyData = submissions.length > 0;
    const hasFilteredData = filteredSubmissions.length > 0;

    return (
        <>
            <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                {showCreateButton && (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Submissions</h2>
                        <Link
                            href={filterAnnex === 'SUMMARY' 
                                ? '/hei/summary/create'
                                : `/hei/annex-${filterAnnex.toLowerCase()}/submit`
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <IoCreate />
                            Create New {filterAnnex === 'SUMMARY' ? 'Summary' : (filterAnnex === 'D' || filterAnnex === 'G' ? 'Submission' : 'Batch')}
                        </Link>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {mode === 'hei' ? 'Select Form' : 'Filter by Form'}
                        </label>
                        <select
                            value={filterAnnex}
                            onChange={(e) => mode === 'hei' ? handleAnnexChange(e.target.value) : setFilterAnnex(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {mode === 'admin' && <option value="all">All Form</option>}
                            {annexOptions.map(annex => {
                                // Handle SUMMARY specially
                                if (annex === 'SUMMARY') {
                                    return (
                                        <option key="SUMMARY" value="SUMMARY">
                                            Summary - School Details
                                        </option>
                                    );
                                }
                                // For standard annexes, look up name in ANNEX_NAMES
                                const name = ANNEX_NAMES[annex];
                                return (
                                    <option key={annex} value={annex}>
                                        Annex {annex} - {name || annex}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            {mode === 'hei' && <option value="draft">Draft</option>}
                            <option value="submitted">Submitted</option>
                            <option value="published">Published</option>
                            <option value="request">Pending Requests</option>
                            <option value="overwritten">Overwritten</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Academic Year
                        </label>
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Years</option>
                            {academicYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-2">
                {!hasAnyData ? (
                    <EmptyState
                        title="No Submissions Yet"
                        message="You haven't created any submissions yet. Get started by creating your first submission."
                        buttonText={showCreateButton ? "Create Your First Submission" : undefined}
                        buttonHref={showCreateButton ? `/hei/annex-${filterAnnex.toLowerCase()}/submit` : undefined}
                    />
                ) : !hasFilteredData ? (
                    <EmptyState
                        title="No Matching Submissions"
                        message="No submissions match your current filters. Try adjusting the filters above."
                    />
                ) : (
                    filteredSubmissions.map((submission) => {
                        const key = `${submission.annex}-${submission.batch_id}`;
                        const isExpanded = expandedBatches[key];
                        const data = batchData[key];
                        const isLoading = loadingBatch === key;

                        return (
                            <div
                                key={key}
                                className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                                    onClick={() => toggleBatch(submission.batch_id, submission.annex)}
                                >
                                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {submission.annex === 'SUMMARY' ? 'Summary' : `Annex ${submission.annex}`}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {submission.form_name}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {submission.academic_year}
                                        </div>
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDateTime(submission.submitted_at || submission.created_at)}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {submission.request_notes || '-'}
                                        </div>
                                        <div className="flex justify-end items-center gap-2">
                                            {mode === 'hei' && (
                                                <Link
                                                    href={submission.annex === 'SUMMARY' 
                                                        ? `/hei/summary/${submission.id}/edit`
                                                        : `/hei/annex-${submission.annex.toLowerCase()}/${submission.submission_id || submission.batch_id}/edit`
                                                    }
                                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {mode === 'admin' && submission.status === 'request' && (
                                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => openCompareModal(submission)}
                                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                                    >
                                                        <IoEye size={14} /> Compare
                                                    </button>
                                                    <button
                                                        onClick={() => onApprove(submission.id, submission.annex)}
                                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => onReject(submission.id, submission.annex)}
                                                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {isExpanded ? (
                                                <IoChevronUp className="text-gray-400" size={20} />
                                            ) : (
                                                <IoChevronDown className="text-gray-400" size={20} />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                                        {isLoading ? (
                                            <div className="text-center py-8">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading data...</p>
                                            </div>
                                        ) : data ? (
                                            renderBatchContent(submission.annex, data)
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">Failed to load data.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Compare Modal (Admin only) */}
            {mode === 'admin' && compareModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={() => setCompareModal(null)}
                        ></div>
                        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                            {compareModal.loading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading comparison...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Compare: Annex {compareModal.newBatch.annex} - {compareModal.newBatch.academic_year}
                                        </h2>
                                    </div>
                                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                                                        Published
                                                    </span> Current
                                                </h3>
                                                {renderBatchContent(compareModal.oldBatch.annex, compareModal.oldBatch.data)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                                                        Request
                                                    </span> New
                                                </h3>
                                                {renderBatchContent(compareModal.newBatch.annex, compareModal.newBatch.data)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                        <button
                                            onClick={() => setCompareModal(null)}
                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCompareModal(null);
                                                onApprove(compareModal.newBatch.id, compareModal.newBatch.annex);
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Approve Request
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
