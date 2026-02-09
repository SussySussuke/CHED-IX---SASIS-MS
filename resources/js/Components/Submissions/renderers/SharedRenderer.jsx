import React from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import AGGridViewer from '../../Common/AGGridViewer';
import CustomTable from '../../Common/CustomTable';
import { getAnnexConfig } from '../../../Config/formConfig';
import { getSharedRendererConfig } from '../../../Config/sharedRendererConfig';

/**
 * SharedRenderer - Universal renderer for standard forms
 * 
 * Handles four rendering types:
 * 1. form-only: Display form fields only (SUMMARY, D)
 * 2. table-only: Single table display (standard annexes A, B, C, MER3, etc.)
 * 3. hybrid: Form fields + multiple tables (MER1, MER2, G)
 * 4. custom-table: Fixed-row tables with file uploads (MER4A)
 * 
 * Does NOT handle: H, M (they use custom renderers in AnnexRenderers.jsx)
 */
export function renderSharedContent(annex, data, isDark) {
  const config = getSharedRendererConfig(annex);
  
  if (!config) {
    return <p className="text-gray-500 dark:text-gray-400">Invalid configuration for {annex}</p>;
  }

  // Render based on type
  if (config.renderType === 'form-only') {
    return renderFormOnly(annex, data, config, isDark);
  }
  
  if (config.renderType === 'table-only') {
    return renderTableOnly(annex, data, config, isDark);
  }
  
  if (config.renderType === 'hybrid') {
    return renderHybrid(annex, data, config, isDark);
  }
  
  if (config.renderType === 'custom-table') {
    return renderCustomTable(annex, data, config, isDark);
  }

  return <p className="text-gray-500 dark:text-gray-400">Unknown render type for {annex}</p>;
}

/**
 * Render form-only view (SUMMARY, D)
 */
function renderFormOnly(annex, data, config, isDark) {
  // Get the main data object based on first formSection key
  const dataKey = config.formSections?.[0]?.key || config.formSection?.key;
  const formData = data[dataKey];
  
  if (!formData) {
    return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Render formSections (multiple sections) */}
      {config.formSections && config.formSections.map((section, index) => {
        const sectionData = data[section.key];
        if (!sectionData) return null;

        return (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{section.title}</h3>
            <div className={`grid ${section.layout === '2-column' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 text-sm`}>
              {section.fields.map(field => (
                <div key={field.key}>
                  <span className="font-medium text-gray-600 dark:text-gray-400">{field.label}:</span>
                  <p className="text-gray-900 dark:text-white">
                    {renderFieldValue(sectionData[field.key], field.format)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Render special fields (arrays, etc.) */}
      {config.specialFields && config.specialFields.map((special, index) => {
        const value = formData[special.key];
        if (!value) return null;

        if (special.type === 'array-list') {
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{special.title}</h3>
              <ul className="list-disc list-inside text-gray-900 dark:text-white">
                {Array.isArray(value) && value.map((item, idx) => (
                  <li key={idx} className="break-all">{item}</li>
                ))}
              </ul>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/**
 * Render table-only view (standard annexes, MER3)
 */
function renderTableOnly(annex, data, config, isDark) {
  const tableSection = config.tableSections[0];
  const tableData = data[tableSection.key] || [];

  if (tableData.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;
  }

  // If using ANNEX_CONFIG columns
  if (tableSection.useAnnexConfig) {
    const annexConfig = getAnnexConfig(annex);
    if (!annexConfig) {
      return <p className="text-gray-500 dark:text-gray-400">Configuration not found for {annex}</p>;
    }

    // Convert Handsontable column config to AG Grid column defs
    const columnDefs = annexConfig.columns.map(col => {
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
    const rowData = tableData.map(entity => 
      annexConfig.dataMapper ? annexConfig.dataMapper(entity) : entity
    );

    return (
      <div>
        {tableSection.title && (
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {tableSection.title}
          </h3>
        )}
        <AGGridViewer
          rowData={rowData}
          columnDefs={columnDefs}
          height="500px"
          paginationPageSize={25}
        />
      </div>
    );
  }

  // Use columns from config directly
  return (
    <div>
      {tableSection.title && (
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {tableSection.title}
        </h3>
      )}
      <AGGridViewer
        rowData={tableData}
        columnDefs={tableSection.columns}
        height="500px"
        paginationPageSize={25}
      />
    </div>
  );
}

/**
 * Render hybrid view (form + tables) - MER1, MER2, G
 */
function renderHybrid(annex, data, config, isDark) {
  const formData = data[config.formSection?.key];
  
  if (!formData) {
    return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Single Form Section (primary) */}
      {config.formSection && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            {config.formSection.title}
          </h3>
          <div className={`grid ${config.formSection.layout === '2-column' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 text-sm`}>
            {config.formSection.fields.map(field => (
              <div key={field.key}>
                <span className="font-medium text-gray-600 dark:text-gray-400">{field.label}:</span>
                <p className="text-gray-900 dark:text-white">
                  {renderFieldValue(formData[field.key], field.format)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Form Sections (for G - frequencies and types) */}
      {config.formSections && config.formSections.map((section, index) => {
        const sectionData = data[section.key];
        if (!sectionData) return null;

        return (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{section.title}</h3>
            <div className={`grid ${section.layout === '2-column' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 text-sm`}>
              {section.fields.map(field => (
                <div key={field.key}>
                  <span className="font-medium text-gray-600 dark:text-gray-400">{field.label}:</span>
                  <p className="text-gray-900 dark:text-white">
                    {renderFieldValue(sectionData[field.key], field.format)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Table Sections */}
      {config.tableSections && config.tableSections.map((section, index) => {
        const tableData = data[section.key] || [];
        
        if (tableData.length === 0 && section.optional) {
          return null;
        }

        return (
          <div key={index}>
            {section.title && (
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {section.title} {tableData.length > 0 && `(${tableData.length} entries)`}
              </h3>
            )}
            
            {tableData.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">No data available.</p>
            ) : (
              <AGGridViewer
                rowData={tableData}
                columnDefs={section.columns}
                height="300px"
                paginationPageSize={10}
              />
            )}
          </div>
        );
      })}

      {/* Grouped Table Sections (for MER2 - multiple tables from one data array) */}
      {config.groupedTableSections && (() => {
        const allData = data[config.groupedTableSections.dataKey] || [];
        const groupBy = config.groupedTableSections.groupBy;
        
        return config.groupedTableSections.tables.map((tableConfig, index) => {
          // Filter data for this specific group
          const groupedData = allData.filter(item => item[groupBy] === tableConfig.groupValue);
          
          return (
            <div key={index}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {tableConfig.title} {groupedData.length > 0 && `(${groupedData.length} entries)`}
              </h3>
              
              {groupedData.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">No personnel in this office.</p>
              ) : (
                <AGGridViewer
                  rowData={groupedData}
                  columnDefs={tableConfig.columns}
                  height="300px"
                  paginationPageSize={10}
                />
              )}
            </div>
          );
        });
      })()}

      {/* Text Sections */}
      {config.textSections && config.textSections.map((textSection, index) => {
        const textContent = formData[textSection.key];
        if (!textContent) return null;

        return (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{textSection.title}</h3>
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {textContent}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render custom table view (MER4A) - Fixed rows with file uploads
 */
function renderCustomTable(annex, data, config, isDark) {
  if (!config.customTableSections || config.customTableSections.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No custom table sections configured.</p>;
  }

  return (
    <div className="space-y-6">
      {config.customTableSections.map((section, index) => {
        const tableData = data[section.key] || [];
        
        if (tableData.length === 0) {
          return (
            <div key={index}>
              {section.title && (
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
              )}
              <p className="text-gray-500 dark:text-gray-400 italic">No data available.</p>
            </div>
          );
        }

        // Map data using dataMapper if provided
        const mappedData = section.dataMapper 
          ? tableData.map(section.dataMapper)
          : tableData;

        return (
          <CustomTable
            key={index}
            title={section.title}
            rows={mappedData}
            columns={section.columns}
            viewMode={true} // Always view mode in submissions list
            className=""
          />
        );
      })}
    </div>
  );
}

/**
 * Helper function to render field values with formatting
 */
function renderFieldValue(value, format) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }

  switch (format) {
    case 'boolean':
      return value ? (
        <IoCheckmarkCircle className="text-green-500 text-lg inline" />
      ) : (
        <span className="text-gray-400 dark:text-gray-500">No</span>
      );
    
    case 'number':
      return Number(value).toLocaleString();
    
    case 'currency':
      return '₱' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    case 'date':
      return new Date(value).toLocaleDateString();
    
    case 'url':
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:underline break-all"
        >
          {value}
        </a>
      );
    
    default:
      return value;
  }
}
