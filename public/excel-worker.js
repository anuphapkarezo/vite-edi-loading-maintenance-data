// Import ExcelJS in the worker
importScripts('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js');

self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'CREATE_EXCEL':
        await createExcelFile(data);
        break;
      case 'ADD_DATA_CHUNK':
        await addDataChunk(data);
        break;
      case 'FINALIZE_EXCEL':
        await finalizeExcel(data);
        break;
      case 'CHECK_MEMORY':
        checkMemoryUsage();
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
};

let workbook = null;
let worksheet = null;
let totalDataRows = 0;

function checkMemoryUsage() {
  // Force garbage collection if available
  if (typeof gc === 'function') {
    gc();
  }
  
  self.postMessage({
    type: 'MEMORY_STATUS',
    totalRows: totalDataRows,
    message: `Worker processed ${totalDataRows.toLocaleString()} rows`
  });
}

async function createExcelFile(data) {
  try {
    // Create new workbook and worksheet
    workbook = new ExcelJS.Workbook();
    worksheet = workbook.addWorksheet('Product Routing List');
    
    // Add headers
    worksheet.columns = [
      { header: 'No.', key: 'no', width: 5 },
      { header: 'ITEM TYPE', key: 'item_type', width: 10 },
      { header: 'PRODUCT', key: 'prd_name', width: 20 },
      { header: 'CATEGORY', key: 'category', width: 10 },
      { header: 'FACTORY', key: 'factory_desc', width: 10 },
      { header: 'SEQ', key: 'seq', width: 10 },
      { header: 'UNIT', key: 'unit_desc', width: 10 },
      { header: 'PROCESS', key: 'proc_disp', width: 10 },
      { header: 'LT', key: 'lt_day', width: 10 },
      { header: 'WC', key: 'wc', width: 10 },
      { header: 'R/L', key: 'roll_lot', width: 5 },
      { header: 'SHT LOT', key: 'sht_lot', width: 10 },
      { header: 'GATE', key: 'gate_proc', width: 10 }
    ];

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Apply background color to header cells
    for (let col = 1; col <= 13; col++) {
      const cell = headerRow.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4D55CC' }
      };
    }
    
    totalDataRows = 0;
    
    self.postMessage({
      type: 'EXCEL_CREATED',
      message: 'Excel workbook created successfully'
    });
    
  } catch (error) {
    throw new Error(`Failed to create Excel file: ${error.message}`);
  }
}

async function addDataChunk(data) {
  try {
    const { records, startRowNumber } = data;
    
    if (!workbook || !worksheet) {
      throw new Error('Excel workbook not initialized');
    }
    
    // Process records in small batches with memory monitoring
    const batchSize = 50;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Process each record in the batch
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        
        // Create row data using array (more memory efficient)
        const rowData = [
          startRowNumber + i + j,               // No.
          item.item_type || '',                 // ITEM TYPE
          item.prd_name || '',                  // PRODUCT
          item.category || '',                  // CATEGORY
          item.factory_desc || '',              // FACTORY
          item.seq || '',                       // SEQ
          item.unit_desc || '',                 // UNIT
          item.proc_disp || '',                 // PROCESS
          item.lt_day || '',                    // LT
          item.wc || '',                        // WC
          item.roll_lot || '',                  // R/L
          parseInt(item.sht_lot) || '',         // SHT LOT
          item.gate_proc || ''                  // GATE
        ];
        
        // Add row
        const addedRow = worksheet.addRow(rowData);
        
        // Style GATE column cell with "Y" value (minimal styling)
        if (item.gate_proc === 'Y') {
          const gateCell = addedRow.getCell(13);
          gateCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFA55D' }
          };
        }
        
        totalDataRows++;
      }
      
      // Send progress update after each batch
      self.postMessage({
        type: 'CHUNK_PROCESSED',
        processedCount: i + batch.length,
        totalInChunk: records.length,
        totalDataRows: totalDataRows
      });
      
      // Memory check every 1000 rows
      if (totalDataRows % 1000 === 0) {
        self.postMessage({
          type: 'MEMORY_CHECK',
          totalRows: totalDataRows,
          message: `Processed ${totalDataRows.toLocaleString()} rows`
        });
        
        // Longer pause for memory cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // Short pause between batches
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    self.postMessage({
      type: 'DATA_CHUNK_ADDED',
      message: `Added ${records.length} records to Excel`,
      totalDataRows: totalDataRows
    });
    
  } catch (error) {
    throw new Error(`Failed to add data chunk: ${error.message}`);
  }
}

async function finalizeExcel(data) {
  try {
    const { fileName, factoryNames } = data;
    
    if (!workbook || !worksheet) {
      throw new Error('Excel workbook not initialized');
    }
    
    // Memory check before finalizing
    self.postMessage({
      type: 'MEMORY_CHECK',
      totalRows: totalDataRows,
      message: `Ready to generate Excel with ${totalDataRows.toLocaleString()} rows`
    });
    
    // Check data size limits
    if (totalDataRows > 150000) {
      throw new Error(`Dataset too large (${totalDataRows.toLocaleString()} rows). Maximum recommended: 150,000 rows. Please select fewer factories.`);
    }
    
    self.postMessage({
      type: 'GENERATING_FILE',
      message: `Generating Excel buffer for ${totalDataRows.toLocaleString()} rows...`
    });
    
    // Generate Excel buffer with progressive approach
    let buffer;
    try {
      // First attempt: minimal options
      self.postMessage({
        type: 'GENERATING_FILE',
        message: 'Attempting to generate Excel file (method 1)...'
      });
      
      buffer = await workbook.xlsx.writeBuffer({
        useSharedStrings: false,
        useStyles: false
      });
      
    } catch (error1) {
      try {
        // Second attempt: even more minimal
        self.postMessage({
          type: 'GENERATING_FILE',
          message: 'Trying alternative generation method...'
        });
        
        buffer = await workbook.xlsx.writeBuffer();
        
      } catch (error2) {
        // Final attempt: create new minimal workbook
        self.postMessage({
          type: 'GENERATING_FILE',
          message: 'Using fallback generation method...'
        });
        
        const minimalWorkbook = new ExcelJS.Workbook();
        const minimalWorksheet = minimalWorkbook.addWorksheet('Data');
        
        // Copy only essential data without styling
        const headers = ['No.', 'ITEM TYPE', 'PRODUCT', 'CATEGORY', 'FACTORY', 'SEQ', 'UNIT', 'PROCESS', 'LT', 'WC', 'R/L', 'SHT LOT', 'GATE'];
        minimalWorksheet.addRow(headers);
        
        // Copy data in chunks
        const allRows = worksheet.getRows(2, totalDataRows) || [];
        for (let i = 0; i < allRows.length; i += 1000) {
          const chunk = allRows.slice(i, i + 1000);
          chunk.forEach(row => {
            if (row && row.values) {
              minimalWorksheet.addRow(row.values.slice(1)); // Remove first empty element
            }
          });
          
          // Progress update
          if (i % 5000 === 0) {
            self.postMessage({
              type: 'GENERATING_FILE',
              message: `Copying data: ${Math.min(i + 1000, allRows.length).toLocaleString()}/${allRows.length.toLocaleString()} rows`
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        buffer = await minimalWorkbook.writeBuffer();
      }
    }
    
    // Verify buffer
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('Generated Excel buffer is empty');
    }
    
    const bufferSizeMB = (buffer.byteLength / (1024 * 1024)).toFixed(1);
    
    // Check file size
    if (parseFloat(bufferSizeMB) > 50) {
      throw new Error(`Generated file too large (${bufferSizeMB}MB). Please select fewer factories.`);
    }
    
    self.postMessage({
      type: 'EXCEL_READY',
      buffer: buffer,
      fileName: fileName,
      factoryNames: factoryNames,
      totalRows: totalDataRows,
      fileSizeMB: bufferSizeMB
    });
    
    // Clean up
    workbook = null;
    worksheet = null;
    totalDataRows = 0;
    
  } catch (error) {
    throw new Error(`Failed to finalize Excel: ${error.message}`);
  }
}
