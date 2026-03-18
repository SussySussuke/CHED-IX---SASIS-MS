import React, { useState } from 'react';
import HEILayout from '../../Layouts/HEILayout';
import { IoSchool, IoDocumentText, IoStatsChart, IoShieldCheckmark, IoCall } from 'react-icons/io5';
import Modal from '../../Components/Common/Modal';
import NeedHelp from '../../Components/HEI/NeedHelp';

const Section = ({ icon: Icon, title, children }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
      <Icon className="text-blue-600 dark:text-blue-400 text-xl" />
    </div>
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
    </div>
  </div>
);

const About = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <HEILayout title="About" showHeader={false}>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-8">

          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">About This System</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              CHED HEI SASIS Management System — Region IX
            </p>
          </div>

          {/* What is CHED */}
          <Section icon={IoSchool} title="Commission on Higher Education (CHED)">
            CHED is the governing body that oversees higher education institutions in the Philippines.
            It sets standards, monitors compliance, and collects data from HEIs to guide national
            policies on higher education and student welfare.
          </Section>

          {/* Purpose of the system */}
          <Section icon={IoDocumentText} title="Purpose of This System">
            This system is the official submission portal for Student Affairs and Services (SAS)
            data. HEIs in Region IX use it to submit their annual Annexes and MER (Management
            Evaluation Reports), which document the programs, services, and activities they
            provide to students each academic year.
          </Section>

          {/* What happens to the data */}
          <Section icon={IoStatsChart} title="What Happens to Your Data">
            All submitted data is reviewed and consolidated by CHED Region IX administrators.
            The information is used strictly for statistical reporting and regional monitoring —
            to understand the state of student services across higher education in the region
            and inform policy decisions.
          </Section>

          {/* Data handling note */}
          <Section icon={IoShieldCheckmark} title="Data Handling">
            Submissions are reviewed by authorized CHED personnel only. Data is collected in
            compliance with CHED's mandate under Republic Act No. 7722 (Higher Education Act
            of 1994) and relevant CHED memorandum orders governing SAS reporting requirements.
          </Section>

          {/* Footer CTA */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Have concerns about your submissions or need assistance?
            </p>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              <IoCall className="text-base" />
              Contact CHED
            </button>
          </div>

        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        title="Need Help?"
        size="md"
      >
        <NeedHelp open={isContactOpen} />
      </Modal>
    </HEILayout>
  );
};

export default About;
