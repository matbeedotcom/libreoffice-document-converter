// src/editor/calc.ts
import { OfficeEditor } from './base.js';
import type {
  OperationResult,
  CalcStructure,
  CellRef,
  RangeRef,
  SheetRef,
  ColRef,
  CellData,
  CellValue,
  CellFormat,
  SheetInfo,
} from './types.js';

/**
 * Editor for Calc (spreadsheet) documents
 */
export class CalcEditor extends OfficeEditor {
  getDocumentType(): 'calc' {
    return 'calc';
  }

  getStructure(_options?: { maxResponseChars?: number }): OperationResult<CalcStructure> {
    try {
      const numSheets = this.lok.documentGetParts(this.docPtr);
      const sheets: SheetInfo[] = [];

      for (let i = 0; i < numSheets; i++) {
        const name = this.lok.getPartName(this.docPtr, i) || `Sheet${i + 1}`;
        const dataArea = this.lok.getDataArea(this.docPtr, i);

        sheets.push({
          index: i,
          name,
          usedRange: dataArea.col > 0 && dataArea.row > 0
            ? `A1:${this.rowColToA1(dataArea.row - 1, dataArea.col - 1)}`
            : 'A1',
          rowCount: dataArea.row,
          colCount: dataArea.col,
        });
      }

      const structure: CalcStructure = {
        type: 'calc',
        sheets,
      };

      return this.createResult(structure);
    } catch (error) {
      return this.createErrorResult(`Failed to get structure: ${String(error)}`);
    }
  }

  getSheetNames(): OperationResult<string[]> {
    try {
      const numSheets = this.lok.documentGetParts(this.docPtr);
      const names: string[] = [];

      for (let i = 0; i < numSheets; i++) {
        const name = this.lok.getPartName(this.docPtr, i) || `Sheet${i + 1}`;
        names.push(name);
      }

      return this.createResult(names);
    } catch (error) {
      return this.createErrorResult(`Failed to get sheet names: ${String(error)}`);
    }
  }

  // ============================================
  // Cell reading
  // ============================================

  getCell(cell: CellRef, sheet?: SheetRef): OperationResult<CellData> {
    try {
      this.selectSheet(sheet);
      const { row, col } = this.normalizeCellRef(cell);
      const address = this.rowColToA1(row, col);

      // Navigate to cell
      this.goToCell(address);

      // Get value
      const value = this.getCellValueInternal();
      const formula = this.getCellFormulaInternal();

      return this.createResult({
        address,
        value,
        formula: formula || undefined,
      });
    } catch (error) {
      return this.createErrorResult(`Failed to get cell: ${String(error)}`);
    }
  }

  getCells(range: RangeRef, sheet?: SheetRef, options?: {
    maxResponseChars?: number;
  }): OperationResult<CellData[][]> {
    try {
      this.selectSheet(sheet);
      const { startRow, startCol, endRow, endCol } = this.normalizeRangeRef(range);
      const maxChars = options?.maxResponseChars ?? this.options.maxResponseChars;

      const cells: CellData[][] = [];
      let charCount = 0;
      let truncated = false;

      for (let r = startRow; r <= endRow && !truncated; r++) {
        const rowData: CellData[] = [];

        for (let c = startCol; c <= endCol && !truncated; c++) {
          const address = this.rowColToA1(r, c);
          this.goToCell(address);

          const value = this.getCellValueInternal();
          const cellData: CellData = { address, value };

          const cellStr = JSON.stringify(cellData);
          if (charCount + cellStr.length > maxChars) {
            truncated = true;
            break;
          }

          charCount += cellStr.length;
          rowData.push(cellData);
        }

        if (rowData.length > 0) {
          cells.push(rowData);
        }
      }

      if (truncated) {
        return this.createResultWithTruncation(cells, {
          original: (endRow - startRow + 1) * (endCol - startCol + 1),
          returned: cells.reduce((sum, row) => sum + row.length, 0),
          message: 'Range truncated due to size. Use smaller ranges to paginate.',
        });
      }

      return this.createResult(cells);
    } catch (error) {
      return this.createErrorResult(`Failed to get cells: ${String(error)}`);
    }
  }

  // ============================================
  // Cell writing
  // ============================================

  setCellValue(cell: CellRef, value: string | number, sheet?: SheetRef): OperationResult<{
    oldValue: CellValue;
    newValue: CellValue;
  }> {
    try {
      this.selectSheet(sheet);
      const { row, col } = this.normalizeCellRef(cell);
      const address = this.rowColToA1(row, col);

      // Get old value first
      this.goToCell(address);
      const oldValue = this.getCellValueInternal();

      // Enter the new value
      const valueStr = typeof value === 'number' ? value.toString() : value;
      const args = JSON.stringify({
        StringName: { type: 'string', value: valueStr },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:EnterString', args);

      // Verify by re-reading the cell
      const newValue = this.getCellValueInternal();
      const expectedStr = typeof value === 'number' ? value.toString() : value;
      const verified = newValue === expectedStr || newValue === value;

      return {
        success: true,
        verified,
        data: { oldValue, newValue },
      };
    } catch (error) {
      return this.createErrorResult(`Failed to set cell value: ${String(error)}`);
    }
  }

  setCellFormula(cell: CellRef, formula: string, sheet?: SheetRef): OperationResult<{
    calculatedValue: CellValue;
  }> {
    try {
      this.selectSheet(sheet);
      const { row, col } = this.normalizeCellRef(cell);
      const address = this.rowColToA1(row, col);

      // Navigate and enter formula
      this.goToCell(address);

      const args = JSON.stringify({
        StringName: { type: 'string', value: formula },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:EnterString', args);

      // Get calculated value
      const calculatedValue = this.getCellValueInternal();

      return this.createResult({ calculatedValue });
    } catch (error) {
      return this.createErrorResult(`Failed to set formula: ${String(error)}`);
    }
  }

  setCells(range: RangeRef, values: CellValue[][], sheet?: SheetRef): OperationResult<{
    cellsUpdated: number;
  }> {
    try {
      this.selectSheet(sheet);
      const { startRow, startCol } = this.normalizeRangeRef(range);
      let cellsUpdated = 0;

      for (let r = 0; r < values.length; r++) {
        const rowValues = values[r];
        if (!rowValues) continue;

        for (let c = 0; c < rowValues.length; c++) {
          const value = rowValues[c];
          if (value === null || value === undefined) continue;

          const address = this.rowColToA1(startRow + r, startCol + c);
          this.goToCell(address);

          const valueStr = typeof value === 'number' ? value.toString() : String(value);
          const args = JSON.stringify({
            StringName: { type: 'string', value: valueStr },
          });
          this.lok.postUnoCommand(this.docPtr, '.uno:EnterString', args);
          cellsUpdated++;
        }
      }

      return this.createResult({ cellsUpdated });
    } catch (error) {
      return this.createErrorResult(`Failed to set cells: ${String(error)}`);
    }
  }

  // ============================================
  // Clear operations
  // ============================================

  clearCell(cell: CellRef, sheet?: SheetRef): OperationResult<{ oldValue: CellValue }> {
    try {
      this.selectSheet(sheet);
      const { row, col } = this.normalizeCellRef(cell);
      const address = this.rowColToA1(row, col);

      this.goToCell(address);
      const oldValue = this.getCellValueInternal();

      this.lok.postUnoCommand(this.docPtr, '.uno:ClearContents');

      return this.createResult({ oldValue });
    } catch (error) {
      return this.createErrorResult(`Failed to clear cell: ${String(error)}`);
    }
  }

  clearRange(range: RangeRef, sheet?: SheetRef): OperationResult<{ cellsCleared: number }> {
    try {
      this.selectSheet(sheet);
      const rangeStr = this.normalizeRangeToString(range);

      // Select range and clear
      this.goToCell(rangeStr);
      this.lok.postUnoCommand(this.docPtr, '.uno:ClearContents');

      // Count is approximate
      const { startRow, startCol, endRow, endCol } = this.normalizeRangeRef(range);
      const cellsCleared = (endRow - startRow + 1) * (endCol - startCol + 1);

      return this.createResult({ cellsCleared });
    } catch (error) {
      return this.createErrorResult(`Failed to clear range: ${String(error)}`);
    }
  }

  // ============================================
  // Row/Column operations
  // ============================================

  insertRow(afterRow: number, sheet?: SheetRef): OperationResult<void> {
    try {
      this.selectSheet(sheet);
      this.goToCell(this.rowColToA1(afterRow + 1, 0));
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertRows');
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to insert row: ${String(error)}`);
    }
  }

  insertColumn(afterCol: ColRef, sheet?: SheetRef): OperationResult<void> {
    try {
      this.selectSheet(sheet);
      const colNum = typeof afterCol === 'string'
        ? this.a1ToRowCol(afterCol + '1').col + 1
        : afterCol + 1;

      this.goToCell(this.rowColToA1(0, colNum));
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertColumns');
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to insert column: ${String(error)}`);
    }
  }

  deleteRow(row: number, sheet?: SheetRef): OperationResult<void> {
    try {
      this.selectSheet(sheet);
      this.goToCell(this.rowColToA1(row, 0));
      this.lok.postUnoCommand(this.docPtr, '.uno:DeleteRows');
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to delete row: ${String(error)}`);
    }
  }

  deleteColumn(col: ColRef, sheet?: SheetRef): OperationResult<void> {
    try {
      this.selectSheet(sheet);
      const colNum = typeof col === 'string'
        ? this.a1ToRowCol(col + '1').col
        : col;

      this.goToCell(this.rowColToA1(0, colNum));
      this.lok.postUnoCommand(this.docPtr, '.uno:DeleteColumns');
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to delete column: ${String(error)}`);
    }
  }

  // ============================================
  // Formatting
  // ============================================

  formatCells(range: RangeRef, format: CellFormat, sheet?: SheetRef): OperationResult<void> {
    try {
      this.selectSheet(sheet);
      const rangeStr = this.normalizeRangeToString(range);
      this.goToCell(rangeStr);

      if (format.bold !== undefined) {
        this.lok.postUnoCommand(this.docPtr, '.uno:Bold');
      }
      if (format.numberFormat !== undefined) {
        const args = JSON.stringify({
          NumberFormatValue: { type: 'string', value: format.numberFormat },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:NumberFormatValue', args);
      }
      if (format.backgroundColor !== undefined) {
        const args = JSON.stringify({
          BackgroundColor: { type: 'long', value: this.hexToNumber(format.backgroundColor) },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:BackgroundColor', args);
      }

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to format cells: ${String(error)}`);
    }
  }

  // ============================================
  // Sheet management
  // ============================================

  addSheet(name: string): OperationResult<{ index: number }> {
    try {
      const args = JSON.stringify({
        Name: { type: 'string', value: name },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:Insert', args);

      const numSheets = this.lok.documentGetParts(this.docPtr);
      return this.createResult({ index: numSheets - 1 });
    } catch (error) {
      return this.createErrorResult(`Failed to add sheet: ${String(error)}`);
    }
  }

  renameSheet(sheet: SheetRef, newName: string): OperationResult<void> {
    try {
      this.selectSheet(sheet);
      const args = JSON.stringify({
        Name: { type: 'string', value: newName },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:RenameTable', args);
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to rename sheet: ${String(error)}`);
    }
  }

  deleteSheet(sheet: SheetRef): OperationResult<void> {
    try {
      this.selectSheet(sheet);
      this.lok.postUnoCommand(this.docPtr, '.uno:Remove');
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to delete sheet: ${String(error)}`);
    }
  }

  // ============================================
  // Private helpers
  // ============================================

  private selectSheet(sheet?: SheetRef): void {
    if (sheet === undefined) return;

    const index = typeof sheet === 'number'
      ? sheet
      : this.getSheetIndexByName(sheet);

    if (index >= 0) {
      this.lok.documentSetPart(this.docPtr, index);
    }
  }

  private getSheetIndexByName(name: string): number {
    const numSheets = this.lok.documentGetParts(this.docPtr);
    for (let i = 0; i < numSheets; i++) {
      if (this.lok.getPartName(this.docPtr, i) === name) {
        return i;
      }
    }
    return -1;
  }

  private goToCell(address: string): void {
    const args = JSON.stringify({
      ToPoint: { type: 'string', value: address },
    });
    this.lok.postUnoCommand(this.docPtr, '.uno:GoToCell', args);
  }

  private getCellValueInternal(): CellValue {
    const text = this.lok.getTextSelection(this.docPtr, 'text/plain');
    if (!text) return null;

    // Try to parse as number
    const num = parseFloat(text);
    if (!isNaN(num) && text.trim() === num.toString()) {
      return num;
    }

    // Check for boolean
    if (text.toLowerCase() === 'true') return true;
    if (text.toLowerCase() === 'false') return false;

    return text;
  }

  private getCellFormulaInternal(): string | null {
    const result = this.lok.getCommandValues(this.docPtr, '.uno:GetFormulaBarText');
    if (!result) return null;

    try {
      const parsed = JSON.parse(result) as { value?: string };
      return parsed.value ?? null;
    } catch {
      return null;
    }
  }

  private normalizeRangeRef(range: RangeRef): {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } {
    if (typeof range === 'string') {
      const parts = range.split(':');
      const start = this.a1ToRowCol(parts[0]!);
      const end = parts[1] ? this.a1ToRowCol(parts[1]) : start;
      return {
        startRow: start.row,
        startCol: start.col,
        endRow: end.row,
        endCol: end.col,
      };
    }

    const start = this.normalizeCellRef(range.start);
    const end = this.normalizeCellRef(range.end);
    return {
      startRow: start.row,
      startCol: start.col,
      endRow: end.row,
      endCol: end.col,
    };
  }

  private normalizeRangeToString(range: RangeRef): string {
    if (typeof range === 'string') return range;

    const start = this.normalizeCellRef(range.start);
    const end = this.normalizeCellRef(range.end);
    return `${this.rowColToA1(start.row, start.col)}:${this.rowColToA1(end.row, end.col)}`;
  }

  private hexToNumber(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }
}
