/**
 * Standard Default Schemas for All 12 ERP Modules
 * Loaded by configEngine and customized at runtime via Admin Studio.
 */

export const DEFAULT_SCHEMAS = {
  // 1. Finance: Invoices
  invoice: {
    entityId: 'invoice',
    label: 'Invoice',
    pluralLabel: 'Invoices',
    primaryKey: 'id',
    titleField: 'invoiceNumber',
    numbering: { prefix: 'INV-2026-', padLength: 4 },
    permissions: { view: 'finance.view', create: 'finance.create', edit: 'finance.edit', delete: 'finance.admin' },
    fields: [
      { id: 'invoiceNumber', label: 'Invoice #', type: 'text', required: true, readOnly: true, grid: { order: 1, visible: true } },
      { id: 'type', label: 'Type', type: 'select', options: [{ value: 'sales', label: 'Sales Invoice' }, { value: 'purchase', label: 'Purchase Bill' }], required: true, grid: { order: 2, visible: true } },
      { id: 'customerName', label: 'Party / Customer Name', type: 'text', required: true, grid: { order: 3, visible: true } },
      { id: 'date', label: 'Date', type: 'date', defaultValue: '$TODAY', required: true, grid: { order: 4, visible: true } },
      { id: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { id: 'subtotal', label: 'Subtotal Amount', type: 'currency', required: true },
      { id: 'taxAmount', label: 'Tax (GST)', type: 'currency', required: true },
      { id: 'totalAmount', label: 'Total Amount', type: 'currency', required: true, grid: { order: 5, visible: true, format: 'currency' } },
      { id: 'status', label: 'Status', type: 'workflow_status', defaultValue: 'draft', grid: { order: 6, visible: true } },
      { id: 'paymentStatus', label: 'Payment', type: 'select', options: ['unpaid', 'partially_paid', 'paid'], defaultValue: 'unpaid', grid: { order: 7, visible: true } },
      { id: 'notes', label: 'Notes & Terms', type: 'textarea' }
    ],
    layout: {
      sections: [
        { title: 'Invoice Details', columns: 3, fields: ['invoiceNumber', 'type', 'customerName', 'date', 'dueDate'] },
        { title: 'Financial Totals', columns: 3, fields: ['subtotal', 'taxAmount', 'totalAmount'] },
        { title: 'Status & Terms', columns: 2, fields: ['status', 'paymentStatus', 'notes'] }
      ]
    },
    workflow: {
      initial: 'draft',
      states: {
        draft: { label: 'Draft', color: 'gray' },
        posted: { label: 'Posted to GL', color: 'blue' },
        paid: { label: 'Settled & Paid', color: 'green' },
        cancelled: { label: 'Cancelled', color: 'red' }
      },
      transitions: [
        { from: 'draft', to: 'posted', label: 'Post to General Ledger', permission: 'finance.edit', autoAction: 'emit:finance.invoice.posted' },
        { from: 'posted', to: 'paid', label: 'Record Full Settlement', permission: 'finance.edit', autoAction: 'emit:finance.invoice.paid' },
        { from: 'draft', to: 'cancelled', label: 'Void Invoice', permission: 'finance.admin' }
      ]
    }
  },

  // 2. Inventory: Items
  item: {
    entityId: 'item',
    label: 'Inventory Item',
    pluralLabel: 'Inventory Items',
    primaryKey: 'id',
    titleField: 'name',
    numbering: { prefix: 'ITM-', padLength: 4 },
    permissions: { view: 'inventory.view', create: 'inventory.create', edit: 'inventory.edit', delete: 'inventory.admin' },
    fields: [
      { id: 'sku', label: 'SKU / Item Code', type: 'text', required: true, grid: { order: 1, visible: true } },
      { id: 'name', label: 'Item Name', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'category', label: 'Category', type: 'select', options: ['Raw Materials', 'Finished Goods', 'Spare Parts', 'Consumables'], required: true, grid: { order: 3, visible: true } },
      { id: 'unit', label: 'UoM (Unit)', type: 'select', options: ['KG', 'PCS', 'MTR', 'LITRE', 'SET', 'BOX'], required: true, grid: { order: 4, visible: true } },
      { id: 'costPrice', label: 'Cost Price', type: 'currency', required: true, grid: { order: 5, visible: true, format: 'currency' } },
      { id: 'sellingPrice', label: 'Selling Price', type: 'currency', required: true, grid: { order: 6, visible: true, format: 'currency' } },
      { id: 'currentStock', label: 'Stock On Hand', type: 'number', required: true, grid: { order: 7, visible: true, format: 'number' } },
      { id: 'reorderPoint', label: 'Safety Reorder Level', type: 'number', defaultValue: 100 },
      { id: 'warehouse', label: 'Default Warehouse', type: 'select', options: ['WH-MAIN-PUNE', 'WH-BHIWANDI-FG'], required: true },
      { id: 'bin', label: 'Bin / Rack Location', type: 'text' },
      { id: 'valuationMethod', label: 'Valuation Method', type: 'select', options: ['FIFO', 'weighted_average'], defaultValue: 'FIFO' },
      { id: 'status', label: 'Status', type: 'select', options: ['active', 'discontinued'], defaultValue: 'active' }
    ],
    layout: {
      sections: [
        { title: 'Primary Classification', columns: 3, fields: ['sku', 'name', 'category', 'unit'] },
        { title: 'Pricing & Valuation', columns: 3, fields: ['costPrice', 'sellingPrice', 'valuationMethod'] },
        { title: 'Stock & Warehouse Location', columns: 3, fields: ['currentStock', 'reorderPoint', 'warehouse', 'bin', 'status'] }
      ]
    }
  },

  // 3. Procurement: Purchase Orders
  purchase_order: {
    entityId: 'purchase_order',
    label: 'Purchase Order',
    pluralLabel: 'Purchase Orders',
    primaryKey: 'id',
    titleField: 'poNumber',
    numbering: { prefix: 'PO-2026-', padLength: 4 },
    permissions: { view: 'procurement.view', create: 'procurement.create', edit: 'procurement.edit', delete: 'procurement.admin' },
    fields: [
      { id: 'poNumber', label: 'PO Number', type: 'text', required: true, readOnly: true, grid: { order: 1, visible: true } },
      { id: 'vendorName', label: 'Supplier / Vendor', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'orderDate', label: 'PO Date', type: 'date', defaultValue: '$TODAY', required: true, grid: { order: 3, visible: true } },
      { id: 'expectedDate', label: 'Expected Delivery', type: 'date', required: true, grid: { order: 4, visible: true } },
      { id: 'subtotal', label: 'Subtotal Amount', type: 'currency', required: true },
      { id: 'taxAmount', label: 'Tax (GST)', type: 'currency', required: true },
      { id: 'grandTotal', label: 'Grand Total', type: 'currency', required: true, grid: { order: 5, visible: true, format: 'currency' } },
      { id: 'status', label: 'Status', type: 'workflow_status', defaultValue: 'draft', grid: { order: 6, visible: true } },
      { id: 'threeWayMatched', label: '3-Way Match Verified', type: 'checkbox', defaultValue: false, grid: { order: 7, visible: true } }
    ],
    layout: {
      sections: [
        { title: 'Vendor & Delivery Dates', columns: 3, fields: ['poNumber', 'vendorName', 'orderDate', 'expectedDate'] },
        { title: 'Financial Values', columns: 3, fields: ['subtotal', 'taxAmount', 'grandTotal'] },
        { title: 'Approval & Verification', columns: 2, fields: ['status', 'threeWayMatched'] }
      ]
    },
    workflow: {
      initial: 'draft',
      states: {
        draft: { label: 'Draft Requisition', color: 'gray' },
        approved: { label: 'Approved & Placed', color: 'blue' },
        received: { label: 'GRN Received', color: 'indigo' },
        matched: { label: '3-Way Matched', color: 'green' },
        cancelled: { label: 'Cancelled', color: 'red' }
      },
      transitions: [
        { from: 'draft', to: 'approved', label: 'Approve Purchase Order', permission: 'procurement.edit', autoAction: 'emit:procurement.po.approved' },
        { from: 'approved', to: 'received', label: 'Record Goods Receipt (GRN)', permission: 'inventory.create', autoAction: 'emit:inventory.grn.received' },
        { from: 'received', to: 'matched', label: 'Confirm 3-Way Match', permission: 'finance.edit' },
        { from: 'draft', to: 'cancelled', label: 'Cancel PO', permission: 'procurement.admin' }
      ]
    }
  },

  // 4. Sales: Orders
  sales_order: {
    entityId: 'sales_order',
    label: 'Sales Order',
    pluralLabel: 'Sales Orders',
    primaryKey: 'id',
    titleField: 'orderNumber',
    numbering: { prefix: 'SO-2026-', padLength: 4 },
    permissions: { view: 'sales.view', create: 'sales.create', edit: 'sales.edit', delete: 'sales.admin' },
    fields: [
      { id: 'orderNumber', label: 'Order Number', type: 'text', required: true, readOnly: true, grid: { order: 1, visible: true } },
      { id: 'customerName', label: 'Customer', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'orderDate', label: 'Order Date', type: 'date', defaultValue: '$TODAY', required: true, grid: { order: 3, visible: true } },
      { id: 'deliveryDate', label: 'Delivery Commitment', type: 'date', required: true, grid: { order: 4, visible: true } },
      { id: 'subtotal', label: 'Net Subtotal', type: 'currency', required: true },
      { id: 'taxAmount', label: 'Tax Amount', type: 'currency', required: true },
      { id: 'grandTotal', label: 'Grand Total', type: 'currency', required: true, grid: { order: 5, visible: true, format: 'currency' } },
      { id: 'status', label: 'Status', type: 'workflow_status', defaultValue: 'draft', grid: { order: 6, visible: true } }
    ],
    layout: {
      sections: [
        { title: 'Order Details', columns: 3, fields: ['orderNumber', 'customerName', 'orderDate', 'deliveryDate'] },
        { title: 'Financial Pricing', columns: 3, fields: ['subtotal', 'taxAmount', 'grandTotal'] },
        { title: 'Workflow Progression', columns: 1, fields: ['status'] }
      ]
    },
    workflow: {
      initial: 'draft',
      states: {
        draft: { label: 'Draft', color: 'gray' },
        confirmed: { label: 'Confirmed & Reserved', color: 'blue' },
        dispatched: { label: 'Dispatched', color: 'indigo' },
        invoiced: { label: 'Invoiced & Completed', color: 'green' },
        cancelled: { label: 'Cancelled', color: 'red' }
      },
      transitions: [
        { from: 'draft', to: 'confirmed', label: 'Confirm & Reserve Stock', permission: 'sales.edit', autoAction: 'emit:sales.order.confirmed' },
        { from: 'confirmed', to: 'dispatched', label: 'Dispatch Shipment', permission: 'inventory.edit', autoAction: 'emit:sales.order.dispatched' },
        { from: 'dispatched', to: 'invoiced', label: 'Generate Sales Invoice', permission: 'finance.create', autoAction: 'emit:sales.order.invoiced' },
        { from: 'draft', to: 'cancelled', label: 'Cancel Order', permission: 'sales.admin' }
      ]
    }
  },

  // 5. CRM: Leads
  lead: {
    entityId: 'lead',
    label: 'Sales Lead',
    pluralLabel: 'CRM Leads',
    primaryKey: 'id',
    titleField: 'name',
    permissions: { view: 'crm.view', create: 'crm.create', edit: 'crm.edit', delete: 'crm.admin' },
    fields: [
      { id: 'name', label: 'Lead Contact Name', type: 'text', required: true, grid: { order: 1, visible: true } },
      { id: 'company', label: 'Organization / Company', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'stage', label: 'Pipeline Stage', type: 'select', options: ['New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'], defaultValue: 'New', grid: { order: 3, visible: true } },
      { id: 'potentialValue', label: 'Estimated Deal Value', type: 'currency', required: true, grid: { order: 4, visible: true, format: 'currency' } },
      { id: 'email', label: 'Email Address', type: 'email', required: true, grid: { order: 5, visible: true } },
      { id: 'phone', label: 'Direct Phone', type: 'phone', required: true },
      { id: 'source', label: 'Lead Source', type: 'select', options: ['Trade Expo', 'Direct Inbound', 'Referral', 'Web Campaign', 'Cold Outreach'], defaultValue: 'Web Campaign' }
    ],
    layout: {
      sections: [
        { title: 'Contact & Account', columns: 2, fields: ['name', 'company', 'email', 'phone'] },
        { title: 'Deal Metrics', columns: 3, fields: ['stage', 'potentialValue', 'source'] }
      ]
    }
  },

  // 6. HRMS: Employees
  employee: {
    entityId: 'employee',
    label: 'Employee',
    pluralLabel: 'Employees',
    primaryKey: 'id',
    titleField: 'name',
    numbering: { prefix: 'EMP-', padLength: 4 },
    permissions: { view: 'hrms.view', create: 'hrms.create', edit: 'hrms.edit', delete: 'hrms.admin' },
    fields: [
      { id: 'code', label: 'Employee ID', type: 'text', required: true, grid: { order: 1, visible: true } },
      { id: 'name', label: 'Full Legal Name', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'department', label: 'Department', type: 'select', options: ['Executive', 'Operations', 'Finance', 'Engineering', 'Commercial', 'Quality'], required: true, grid: { order: 3, visible: true } },
      { id: 'designation', label: 'Designation / Title', type: 'text', required: true, grid: { order: 4, visible: true } },
      { id: 'baseSalary', label: 'Monthly Base Gross Salary', type: 'currency', required: true, grid: { order: 5, visible: true, format: 'currency' } },
      { id: 'joiningDate', label: 'Joining Date', type: 'date', required: true, grid: { order: 6, visible: true } },
      { id: 'leavesBalance', label: 'Leave Balance (Days)', type: 'number', defaultValue: 18, grid: { order: 7, visible: true } },
      { id: 'status', label: 'Employment Status', type: 'select', options: ['active', 'probation', 'resigned'], defaultValue: 'active' }
    ],
    layout: {
      sections: [
        { title: 'Identity & Organization', columns: 3, fields: ['code', 'name', 'department', 'designation'] },
        { title: 'Compensation & Tenure', columns: 3, fields: ['baseSalary', 'joiningDate', 'leavesBalance', 'status'] }
      ]
    }
  },

  // 7. Manufacturing: Work Orders
  work_order: {
    entityId: 'work_order',
    label: 'Production Work Order',
    pluralLabel: 'Work Orders',
    primaryKey: 'id',
    titleField: 'orderNumber',
    numbering: { prefix: 'WO-2026-', padLength: 3 },
    permissions: { view: 'manufacturing.view', create: 'manufacturing.create', edit: 'manufacturing.edit', delete: 'manufacturing.admin' },
    fields: [
      { id: 'orderNumber', label: 'WO Number', type: 'text', required: true, readOnly: true, grid: { order: 1, visible: true } },
      { id: 'itemName', label: 'Output Assembly / Part', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'quantity', label: 'Target Quantity', type: 'number', required: true, grid: { order: 3, visible: true } },
      { id: 'produced', label: 'Completed Good Units', type: 'number', defaultValue: 0, grid: { order: 4, visible: true } },
      { id: 'status', label: 'Shop Floor Status', type: 'workflow_status', defaultValue: 'scheduled', grid: { order: 5, visible: true } },
      { id: 'startDate', label: 'Planned Start', type: 'date', defaultValue: '$TODAY', grid: { order: 6, visible: true } },
      { id: 'endDate', label: 'Target Completion', type: 'date', required: true }
    ],
    layout: {
      sections: [
        { title: 'Production Schedule', columns: 3, fields: ['orderNumber', 'itemName', 'quantity', 'produced', 'startDate', 'endDate'] },
        { title: 'Status', columns: 1, fields: ['status'] }
      ]
    },
    workflow: {
      initial: 'scheduled',
      states: {
        scheduled: { label: 'Scheduled', color: 'gray' },
        in_progress: { label: 'In Progress (Shop Floor)', color: 'blue' },
        completed: { label: 'Completed & Quality Passed', color: 'green' },
        cancelled: { label: 'Cancelled', color: 'red' }
      },
      transitions: [
        { from: 'scheduled', to: 'in_progress', label: 'Release to Floor', permission: 'manufacturing.edit' },
        { from: 'in_progress', to: 'completed', label: 'Mark Production Complete', permission: 'manufacturing.edit', autoAction: 'emit:manufacturing.production.completed' },
        { from: 'scheduled', to: 'cancelled', label: 'Halt Work Order', permission: 'manufacturing.admin' }
      ]
    }
  },

  // 8. SCM: Shipments
  shipment: {
    entityId: 'shipment',
    label: 'Logistics Shipment',
    pluralLabel: 'Logistics Shipments',
    primaryKey: 'id',
    titleField: 'shipmentNumber',
    numbering: { prefix: 'SHP-2026-', padLength: 4 },
    permissions: { view: 'scm.view', create: 'scm.create', edit: 'scm.edit', delete: 'scm.admin' },
    fields: [
      { id: 'shipmentNumber', label: 'Shipment #', type: 'text', required: true, readOnly: true, grid: { order: 1, visible: true } },
      { id: 'carrier', label: 'Logistics Carrier', type: 'select', options: ['Blue Dart Express', 'TCI Freight', 'VRL Logistics', 'Gati-KWE'], required: true, grid: { order: 2, visible: true } },
      { id: 'trackingNumber', label: 'Carrier Docket / AWB', type: 'text', required: true, grid: { order: 3, visible: true } },
      { id: 'origin', label: 'Dispatch Origin', type: 'text', required: true, grid: { order: 4, visible: true } },
      { id: 'destination', label: 'Destination', type: 'text', required: true, grid: { order: 5, visible: true } },
      { id: 'status', label: 'Shipment Status', type: 'workflow_status', defaultValue: 'in_transit', grid: { order: 6, visible: true } },
      { id: 'eta', label: 'Estimated Arrival (ETA)', type: 'date', required: true, grid: { order: 7, visible: true } }
    ],
    layout: {
      sections: [
        { title: 'Freight & Waybill', columns: 3, fields: ['shipmentNumber', 'carrier', 'trackingNumber', 'origin', 'destination', 'eta'] },
        { title: 'Delivery Status', columns: 1, fields: ['status'] }
      ]
    },
    workflow: {
      initial: 'in_transit',
      states: {
        in_transit: { label: 'In Transit', color: 'blue' },
        out_for_delivery: { label: 'Out for Delivery', color: 'indigo' },
        delivered: { label: 'Delivered & Signed', color: 'green' },
        delayed: { label: 'Transit Exception', color: 'yellow' }
      },
      transitions: [
        { from: 'in_transit', to: 'out_for_delivery', label: 'Out for Delivery', permission: 'scm.edit' },
        { from: 'out_for_delivery', to: 'delivered', label: 'Record Proof of Delivery', permission: 'scm.edit', autoAction: 'emit:scm.shipment.delivered' }
      ]
    }
  },

  // 9. Projects
  project: {
    entityId: 'project',
    label: 'Enterprise Project',
    pluralLabel: 'Projects',
    primaryKey: 'id',
    titleField: 'name',
    permissions: { view: 'projects.view', create: 'projects.create', edit: 'projects.edit', delete: 'projects.admin' },
    fields: [
      { id: 'code', label: 'Project Code', type: 'text', required: true, grid: { order: 1, visible: true } },
      { id: 'name', label: 'Project Title', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'manager', label: 'Lead Project Manager', type: 'text', required: true, grid: { order: 3, visible: true } },
      { id: 'budget', label: 'Approved Capex Budget', type: 'currency', required: true, grid: { order: 4, visible: true, format: 'currency' } },
      { id: 'spent', label: 'Actual Costs Incurred', type: 'currency', required: true, grid: { order: 5, visible: true, format: 'currency' } },
      { id: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100, defaultValue: 0, grid: { order: 6, visible: true } },
      { id: 'status', label: 'Lifecycle Status', type: 'select', options: ['active', 'on_hold', 'completed'], defaultValue: 'active', grid: { order: 7, visible: true } }
    ],
    layout: {
      sections: [
        { title: 'Milestone & Execution', columns: 3, fields: ['code', 'name', 'manager', 'budget', 'spent', 'progress', 'status'] }
      ]
    }
  },

  // 10. Quality Management
  inspection: {
    entityId: 'inspection',
    label: 'Quality Inspection',
    pluralLabel: 'Quality Inspections',
    primaryKey: 'id',
    titleField: 'number',
    numbering: { prefix: 'QA-2026-', padLength: 4 },
    permissions: { view: 'quality.view', create: 'quality.create', edit: 'quality.edit', delete: 'quality.admin' },
    fields: [
      { id: 'number', label: 'Inspection #', type: 'text', required: true, readOnly: true, grid: { order: 1, visible: true } },
      { id: 'type', label: 'Audit Stage', type: 'select', options: ['Incoming Material', 'In-Process Inspection', 'Final Assembly Audit', 'Periodic Calibration'], required: true, grid: { order: 2, visible: true } },
      { id: 'target', label: 'Material / Lot Tested', type: 'text', required: true, grid: { order: 3, visible: true } },
      { id: 'inspector', label: 'Auditor Name', type: 'text', required: true, grid: { order: 4, visible: true } },
      { id: 'status', label: 'Result', type: 'select', options: ['passed', 'failed', 'conditional_clearance'], defaultValue: 'passed', grid: { order: 5, visible: true } },
      { id: 'defectCount', label: 'Defects Observed', type: 'number', defaultValue: 0, grid: { order: 6, visible: true } },
      { id: 'date', label: 'Inspection Date', type: 'date', defaultValue: '$TODAY', grid: { order: 7, visible: true } }
    ],
    layout: {
      sections: [
        { title: 'Audit Scope & Findings', columns: 3, fields: ['number', 'type', 'target', 'inspector', 'status', 'defectCount', 'date'] }
      ]
    }
  },

  // 11. Assets & Maintenance
  asset: {
    entityId: 'asset',
    label: 'Fixed Equipment Asset',
    pluralLabel: 'Asset Register',
    primaryKey: 'id',
    titleField: 'name',
    permissions: { view: 'assets.view', create: 'assets.create', edit: 'assets.edit', delete: 'assets.admin' },
    fields: [
      { id: 'assetTag', label: 'Asset Tag ID', type: 'text', required: true, grid: { order: 1, visible: true } },
      { id: 'name', label: 'Equipment Description', type: 'text', required: true, grid: { order: 2, visible: true } },
      { id: 'location', label: 'Shop / Bay Location', type: 'text', required: true, grid: { order: 3, visible: true } },
      { id: 'purchaseCost', label: 'Historical Purchase Cost', type: 'currency', required: true, grid: { order: 4, visible: true, format: 'currency' } },
      { id: 'currentValue', label: 'Net Book Value (Depreciated)', type: 'currency', required: true, grid: { order: 5, visible: true, format: 'currency' } },
      { id: 'status', label: 'Machine Status', type: 'select', options: ['operational', 'under_maintenance', 'decommissioned'], defaultValue: 'operational', grid: { order: 6, visible: true } },
      { id: 'nextServiceDate', label: 'Next Preventive Service', type: 'date', required: true, grid: { order: 7, visible: true } }
    ],
    layout: {
      sections: [
        { title: 'Asset Details & Depreciation', columns: 3, fields: ['assetTag', 'name', 'location', 'purchaseCost', 'currentValue', 'status', 'nextServiceDate'] }
      ]
    }
  }
};

