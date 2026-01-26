import React from 'react';
import AGGridViewer from '../../Common/AGGridViewer';
import { getAnnexConfig, ANNEX_CONFIG } from '../../../Config/formConfig';

/**
 * Generic renderer for standard annexes (A-O) using AGGridViewer
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

    // Convert Handsontable column config to AG Grid column defs
    const columnDefs = config.columns.map(col => {
        const colDef = {
            field: col.data,
            headerName: col.title || col.data,
            minWidth: col.width ? col.width * 0.8 : 100,
        };

        // Handle different column types
        if (col.type === 'numeric') {
            colDef.type = 'numericColumn';
            colDef.valueFormatter = params => {
                if (params.value == null) return '';
                return Number(params.value).toLocaleString();
            };
        } else if (col.type === 'checkbox') {
            colDef.cellRenderer = params => params.value ? '✓' : '';
            colDef.cellStyle = { textAlign: 'center' };
        } else if (col.type === 'date') {
            colDef.valueFormatter = params => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString();
            };
        }

        // Add flex for better responsiveness
        if (!col.width || col.width > 200) {
            colDef.flex = 1;
        }

        return colDef;
    });

    // Map the data using the config's dataMapper if it exists
    const rowData = entities.map(entity => 
        config.dataMapper ? config.dataMapper(entity) : entity
    );

    return (
        <div>
            <AGGridViewer
                rowData={rowData}
                columnDefs={columnDefs}
                height="500px"
                paginationPageSize={25}
            />
        </div>
    );
}
