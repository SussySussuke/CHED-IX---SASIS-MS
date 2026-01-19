import React from 'react';
import AppLayout from './AppLayout';
import Sidebar from '../Components/Common/Sidebar';
import { PERMISSIONS } from '../Utils/permissions';
import PermissionGate from '../Components/Common/PermissionGate';
import { IoGrid, IoCreate, IoLibrary, IoDocumentText, IoTime, IoDocument } from 'react-icons/io5';

const HEILayout = ({ title, children }) => {
  const sidebarLinks = [
    {
      href: '/hei/dashboard',
      label: 'Dashboard',
      icon: <IoGrid />
    },
    {
      label: 'Submission',
      divider: true,
      children: [
        {
          label: 'General Information',
          icon: <IoDocumentText />,
          children: [
            {
              href: '/hei/general-information/create',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/general-information/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex A',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-a/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-a/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex B',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-b/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-b/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex C',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-c/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-c/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex D',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-d/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-d/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex E',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-e/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-e/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex F',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-f/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-f/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex G',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-g/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-g/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex H',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-h/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-h/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex I',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-i/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-i/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex J',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-j/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-j/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex K',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-k/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-k/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex L',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-l/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-l/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex M',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-m/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-m/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex N',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-n/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-n/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        },
        {
          label: 'Annex O',
          icon: <IoDocument />,
          children: [
            {
              href: '/hei/annex-o/submit',
              label: 'Submit',
              icon: <IoCreate />
            },
            {
              href: '/hei/annex-o/history',
              label: 'History',
              icon: <IoTime />
            }
          ]
        }
      ]
    }
  ];

  return (
    <PermissionGate permission={PERMISSIONS.VIEW_OWN_SUBMISSIONS}>
      <AppLayout title={title}>
        <div className="flex">
          <Sidebar links={sidebarLinks} />
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </AppLayout>
    </PermissionGate>
  );
};

export default HEILayout;
