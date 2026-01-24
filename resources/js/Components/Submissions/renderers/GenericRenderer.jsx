import React from 'react';
import { HotTable } from '@handsontable/react';
import { getAnnexConfig, ANNEX_CONFIG } from '../../../Config/formConfig';

/**
 * Generic renderer for standard annexes (A-O) that use HotTable
 */
export function renderGenericAnnex(annex, data, isDark) {
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
}
