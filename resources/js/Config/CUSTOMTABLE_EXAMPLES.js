/**
 * CUSTOMTABLE USAGE EXAMPLES
 * 
 * This file demonstrates all the powerful features of the CustomTable component.
 * Use these examples as reference when creating new forms with CustomTable.
 * 
 * CustomTable supports:
 * - Fixed rows (no add/remove)
 * - Multiple column types: static, text, textarea, number, date, file, checkbox, select
 * - File uploads with preview
 * - Read-only fields
 * - Custom widths
 * - Full dark mode support
 */

// ============================================================================
// EXAMPLE 1: BASIC FIXED TABLE (like MER4)
// ============================================================================
export const EXAMPLE_BASIC_FIXED_TABLE = {
  id: 'example_basic',
  type: 'custom_table',
  title: 'Basic Fixed Table Example',
  subtitle: 'Fixed rows with file upload, checkbox, and text input',
  entityName: 'basic_items',
  
  fixedRows: [
    { id: 'row_1', requirement: 'First requirement description' },
    { id: 'row_2', requirement: 'Second requirement description' },
    { id: 'row_3', requirement: 'Third requirement description' },
  ],
  
  columns: [
    {
      field: 'requirement',
      headerName: 'Requirement',
      type: 'static', // Non-editable
      minWidth: '300px',
    },
    {
      field: 'evidence_file',
      headerName: 'Evidence',
      type: 'file',
      accept: '.pdf',
      minWidth: '200px',
    },
    {
      field: 'completed',
      headerName: 'Completed',
      type: 'checkbox',
      width: '120px',
    },
    {
      field: 'remarks',
      headerName: 'Remarks',
      type: 'text',
      placeholder: 'Add remarks...',
      minWidth: '200px',
    },
  ],
  
  dataMapper: (entity) => ({
    id: entity.id,
    requirement: entity.requirement,
    evidence_file: entity.evidence_file ? JSON.parse(entity.evidence_file) : null,
    completed: entity.completed || false,
    remarks: entity.remarks || '',
  })
};

// ============================================================================
// EXAMPLE 2: ALL COLUMN TYPES SHOWCASE
// ============================================================================
export const EXAMPLE_ALL_COLUMN_TYPES = {
  id: 'example_all_types',
  type: 'custom_table',
  title: 'All Column Types Example',
  subtitle: 'Demonstrating every supported column type',
  entityName: 'all_types_items',
  
  fixedRows: [
    { id: 'item_1', name: 'Item One' },
    { id: 'item_2', name: 'Item Two' },
    { id: 'item_3', name: 'Item Three' },
  ],
  
  columns: [
    {
      field: 'name',
      headerName: 'Name (Static)',
      type: 'static',
      minWidth: '150px',
    },
    {
      field: 'short_text',
      headerName: 'Short Text',
      type: 'text',
      placeholder: 'Enter text...',
      minWidth: '150px',
    },
    {
      field: 'long_text',
      headerName: 'Long Text (Textarea)',
      type: 'textarea',
      rows: 3,
      placeholder: 'Enter description...',
      minWidth: '200px',
    },
    {
      field: 'quantity',
      headerName: 'Quantity (Number)',
      type: 'number',
      placeholder: '0',
      width: '120px',
    },
    {
      field: 'deadline',
      headerName: 'Deadline (Date)',
      type: 'date',
      width: '150px',
    },
    {
      field: 'document',
      headerName: 'Document (File)',
      type: 'file',
      accept: '.pdf,.docx',
      minWidth: '180px',
    },
    {
      field: 'approved',
      headerName: 'Approved (Checkbox)',
      type: 'checkbox',
      width: '120px',
    },
    {
      field: 'status',
      headerName: 'Status (Select)',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
      ],
      width: '150px',
    },
  ],
  
  dataMapper: (entity) => ({
    id: entity.id,
    name: entity.name,
    short_text: entity.short_text || '',
    long_text: entity.long_text || '',
    quantity: entity.quantity || '',
    deadline: entity.deadline || '',
    document: entity.document ? JSON.parse(entity.document) : null,
    approved: entity.approved || false,
    status: entity.status || '',
  })
};

// ============================================================================
// EXAMPLE 3: READ-ONLY FIELDS
// ============================================================================
export const EXAMPLE_READONLY_FIELDS = {
  id: 'example_readonly',
  type: 'custom_table',
  title: 'Read-Only Fields Example',
  subtitle: 'Some columns are editable, others are locked',
  entityName: 'readonly_items',
  
  fixedRows: [
    { id: 'req_1', code: 'REQ-001', requirement: 'Must have licensed staff' },
    { id: 'req_2', code: 'REQ-002', requirement: 'Must maintain records' },
    { id: 'req_3', code: 'REQ-003', requirement: 'Must submit annual reports' },
  ],
  
  columns: [
    {
      field: 'code',
      headerName: 'Code',
      type: 'text',
      readOnly: true, // Cannot be edited
      width: '120px',
    },
    {
      field: 'requirement',
      headerName: 'Requirement',
      type: 'static',
      minWidth: '300px',
    },
    {
      field: 'compliance_status',
      headerName: 'Compliance',
      type: 'select',
      options: [
        { value: 'compliant', label: 'Compliant' },
        { value: 'partial', label: 'Partially Compliant' },
        { value: 'non_compliant', label: 'Non-Compliant' },
      ],
      width: '180px',
    },
    {
      field: 'evidence',
      headerName: 'Evidence',
      type: 'file',
      accept: '.pdf',
      minWidth: '200px',
    },
  ],
  
  dataMapper: (entity) => ({
    id: entity.id,
    code: entity.code,
    requirement: entity.requirement,
    compliance_status: entity.compliance_status || '',
    evidence: entity.evidence ? JSON.parse(entity.evidence) : null,
  })
};

// ============================================================================
// EXAMPLE 4: MULTIPLE FILE TYPES
// ============================================================================
export const EXAMPLE_MULTIPLE_FILE_TYPES = {
  id: 'example_files',
  type: 'custom_table',
  title: 'Different File Upload Types',
  subtitle: 'Each row accepts different file types',
  entityName: 'file_items',
  
  fixedRows: [
    { id: 'doc_1', document_type: 'Policy Document' },
    { id: 'doc_2', document_type: 'Supporting Images' },
    { id: 'doc_3', document_type: 'Spreadsheet Data' },
    { id: 'doc_4', document_type: 'Any Document' },
  ],
  
  columns: [
    {
      field: 'document_type',
      headerName: 'Document Type',
      type: 'static',
      width: '200px',
    },
    {
      field: 'file',
      headerName: 'Upload',
      type: 'file',
      accept: '*', // Accepts all file types
      minWidth: '250px',
    },
    {
      field: 'notes',
      headerName: 'Notes',
      type: 'textarea',
      rows: 2,
      placeholder: 'Add notes...',
      minWidth: '200px',
    },
  ],
  
  dataMapper: (entity) => ({
    id: entity.id,
    document_type: entity.document_type,
    file: entity.file ? JSON.parse(entity.file) : null,
    notes: entity.notes || '',
  })
};

// ============================================================================
// EXAMPLE 5: EVALUATION/RATING TABLE
// ============================================================================
export const EXAMPLE_EVALUATION_TABLE = {
  id: 'example_evaluation',
  type: 'custom_table',
  title: 'Evaluation/Rating Example',
  subtitle: 'Rating criteria with scores and comments',
  entityName: 'evaluation_items',
  
  fixedRows: [
    { id: 'criteria_1', criteria: 'Staff Qualifications and Competence' },
    { id: 'criteria_2', criteria: 'Program Implementation and Delivery' },
    { id: 'criteria_3', criteria: 'Resource Availability and Utilization' },
    { id: 'criteria_4', criteria: 'Documentation and Record Keeping' },
    { id: 'criteria_5', criteria: 'Student Satisfaction and Outcomes' },
  ],
  
  columns: [
    {
      field: 'criteria',
      headerName: 'Evaluation Criteria',
      type: 'static',
      minWidth: '300px',
    },
    {
      field: 'score',
      headerName: 'Score (1-5)',
      type: 'number',
      placeholder: '1-5',
      width: '120px',
    },
    {
      field: 'evidence',
      headerName: 'Supporting Evidence',
      type: 'file',
      accept: '.pdf',
      minWidth: '200px',
    },
    {
      field: 'meets_standard',
      headerName: 'Meets Standard',
      type: 'checkbox',
      width: '140px',
    },
    {
      field: 'evaluator_comments',
      headerName: 'Comments',
      type: 'textarea',
      rows: 2,
      placeholder: 'Evaluator comments...',
      minWidth: '250px',
    },
  ],
  
  dataMapper: (entity) => ({
    id: entity.id,
    criteria: entity.criteria,
    score: entity.score || '',
    evidence: entity.evidence ? JSON.parse(entity.evidence) : null,
    meets_standard: entity.meets_standard || false,
    evaluator_comments: entity.evaluator_comments || '',
  })
};

// ============================================================================
// HOW TO USE IN YOUR CONFIG FILE
// ============================================================================

/**
 * To use CustomTable in your MER config:
 * 
 * 1. Add section with type: 'custom_table'
 * 2. Define fixedRows with unique IDs
 * 3. Define columns with appropriate types
 * 4. Add dataMapper to handle loading existing data
 * 5. In buildPayload, convert file objects to JSON strings
 * 
 * Example config structure:
 */

export const EXAMPLE_MER_CONFIG = {
  name: 'EXAMPLE',
  title: 'Example Form Title',
  endpoint: '/hei/example',
  
  sections: [
    // ... other sections
    
    {
      id: 'custom_table_section',
      type: 'custom_table',
      title: 'Section Title',
      subtitle: 'Optional subtitle',
      entityName: 'items', // Database relation name
      
      fixedRows: [
        { id: 'row_1', requirement: 'First row' },
        { id: 'row_2', requirement: 'Second row' },
      ],
      
      columns: [
        {
          field: 'requirement',
          headerName: 'Requirement',
          type: 'static',
          minWidth: '300px',
        },
        {
          field: 'file',
          headerName: 'File',
          type: 'file',
          accept: '.pdf',
          minWidth: '200px',
        },
        // ... more columns
      ],
      
      dataMapper: (entity) => ({
        id: entity.id,
        requirement: entity.requirement,
        file: entity.file ? JSON.parse(entity.file) : null,
        // ... map other fields
      })
    },
    
    // ... more sections
  ],
  
  buildPayload: (formData, tableData) => {
    // Convert file data to JSON strings for database storage
    const processItems = (items) => {
      return items.map(item => ({
        ...item,
        file: item.file ? JSON.stringify(item.file) : null,
      }));
    };
    
    return {
      academic_year: formData.academic_year,
      items: processItems(tableData.items || []),
      request_notes: formData.request_notes || '',
    };
  }
};
