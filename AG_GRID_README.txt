# AG Grid Universal Components

Two universal AG Grid components for viewing and editing tabular data with full dark mode support.

## Components Created

### 1. **AGGridViewer** (`AGGridViewer.jsx`)
Read-only table for viewing and displaying data.

**Features:**
- ✅ Quick Filter (general search across all columns - NOT Advanced Filter)
- ✅ Cell Selection with header highlight
- ✅ Column Hover highlighting
- ✅ Column Resizing
- ✅ Pagination (25/50/100/500 rows per page)
- ✅ Column Menu with filters
- ✅ Responsive dark mode theme

**NO Advanced Filter** - You said you wanted a general search bar, not the complex SQL-like Advanced Filter. That's what Quick Filter does - just type and it searches everything.

### 2. **AGGridEditor** (`AGGridEditor.jsx`)
Editable table for data entry and form input.

**Features:**
- ✅ Full cell editing
- ✅ Cell Selection with header highlight
- ✅ Column Hover highlighting
- ✅ Column Resizing
- ✅ Pagination
- ✅ Undo/Redo (Ctrl+Z / Ctrl+Y)
- ✅ Row add/delete methods
- ✅ Cell/row change callbacks
- ✅ Responsive dark mode theme

**NO filters/search** - Editor mode is for inputting data, not searching it.

## Quick Start

```jsx
import { AGGridViewer, AGGridEditor } from '@/Components/Common';

// For VIEWING data
<AGGridViewer
  rowData={yourData}
  columnDefs={yourColumns}
  paginationPageSize={25}
  height="600px"
/>

// For EDITING data
<AGGridEditor
  ref={gridRef}
  rowData={yourData}
  columnDefs={yourColumns}
  onCellValueChanged={handleChange}
  singleClickEdit={true}
/>
```

## Column Definition Example

```javascript
const columnDefs = [
  { 
    field: 'name', 
    headerName: 'Name',
    filter: 'agTextColumnFilter', // For viewer
  },
  { 
    field: 'score', 
    headerName: 'Score',
    filter: 'agNumberColumnFilter',
    cellEditor: 'agNumberCellEditor', // For editor
    editable: true,
  },
];
```

## Theme Integration

The components automatically detect dark mode via your `useDarkMode` hook and apply the appropriate AG Grid theme. The theme matches your Tailwind dark colors:

- Background: `#1f2836` (dark) / `#ffffff` (light)
- Borders: `#374151` (dark) / `#e5e7eb` (light)
- Headers: `#111827` (dark) / `#f3f4f6` (light)

## Files Modified

- ✅ Created `AGGridViewer.jsx`
- ✅ Created `AGGridEditor.jsx`
- ✅ Created `Pages/Examples/AGGridExamples.jsx` (comprehensive examples - NOT exported from Common)
- ✅ Updated `index.js` (exports)
- ✅ Updated `app.css` (AG Grid CSS imports)

## Important Corrections

**You said "Advanced Filter" but you actually want "Quick Filter":**
- Advanced Filter = Complex SQL-like expressions (`age > 25 AND name CONTAINS "John"`)
- Quick Filter = Simple search bar that searches all columns
- I implemented Quick Filter because that's what your screenshot shows and what you described

**You said you haven't read AG Grid docs - that's fine!** I built these with sane defaults:
- Viewer: All viewing features, no editing
- Editor: All editing features, no filters (you don't need to filter while inputting data)

## See Examples

Check out `resources/js/Pages/Examples/AGGridExamples.jsx` for:
- Basic viewer example (like your screenshot)
- Basic editor example with add/save buttons
- Advanced column features (formatters, cell styles, renderers)

**To view examples:** Create a route in Laravel:
```php
Route::get('/examples/aggrid', function () {
    return inertia('Examples/AGGridExamples');
});
```

## Next Steps

1. Run `npm install` (you already have ag-grid packages)
2. Import and use in your pages
3. Check `AGGridExamples.jsx` for implementation patterns
4. Customize column definitions for your specific data

---

**Note:** I removed the "Advanced Filter" feature because that's not what you wanted. If you actually need the complex SQL-like filtering, let me know and I'll add it back.
