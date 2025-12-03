// src/editor/draw.ts
import { OfficeEditor } from './base.js';
import type {
  OperationResult,
  DrawStructure,
  PageData,
  PageInfo,
  ShapeData,
  ShapeType,
  Rectangle,
  Size,
  Position,
} from './types.js';

/**
 * Editor for Draw (vector graphics) documents
 * Also handles imported PDFs opened for editing
 */
export class DrawEditor extends OfficeEditor {
  private isImportedPdf: boolean = false;

  getDocumentType(): 'draw' {
    return 'draw';
  }

  setImportedPdf(value: boolean): void {
    this.isImportedPdf = value;
  }

  getStructure(_options?: { maxResponseChars?: number }): OperationResult<DrawStructure> {
    try {
      const numPages = this.lok.documentGetParts(this.docPtr);
      const pages: PageInfo[] = [];

      for (let i = 0; i < numPages; i++) {
        const pageInfo = this.getPageInfoInternal(i);
        pages.push(pageInfo);
      }

      const structure: DrawStructure = {
        type: 'draw',
        pages,
        pageCount: numPages,
        isImportedPdf: this.isImportedPdf,
      };

      return this.createResult(structure);
    } catch (error) {
      return this.createErrorResult(`Failed to get structure: ${error}`);
    }
  }

  // ============================================
  // Page reading
  // ============================================

  getPage(index: number): OperationResult<PageData> {
    try {
      const numPages = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numPages) {
        return this.createErrorResult(
          `Invalid page index: ${index}. Valid range: 0-${numPages - 1}`,
          'Use getStructure() to see available pages'
        );
      }

      this.lok.documentSetPart(this.docPtr, index);
      const size = this.lok.documentGetDocumentSize(this.docPtr);
      const shapes = this.getShapesOnPage();

      const pageData: PageData = {
        index,
        shapes,
        size: { width: size.width, height: size.height },
      };

      return this.createResult(pageData);
    } catch (error) {
      return this.createErrorResult(`Failed to get page: ${error}`);
    }
  }

  getPageCount(): OperationResult<number> {
    try {
      const count = this.lok.documentGetParts(this.docPtr);
      return this.createResult(count);
    } catch (error) {
      return this.createErrorResult(`Failed to get page count: ${error}`);
    }
  }

  // ============================================
  // Page management
  // ============================================

  addPage(options?: { afterPage?: number }): OperationResult<{ index: number }> {
    try {
      const numPages = this.lok.documentGetParts(this.docPtr);

      // Navigate to position
      if (options?.afterPage !== undefined) {
        this.lok.documentSetPart(this.docPtr, options.afterPage);
      } else {
        this.lok.documentSetPart(this.docPtr, numPages - 1);
      }

      // Insert new page
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertPage');

      const newIndex = options?.afterPage !== undefined
        ? options.afterPage + 1
        : numPages;

      return this.createResult({ index: newIndex });
    } catch (error) {
      return this.createErrorResult(`Failed to add page: ${error}`);
    }
  }

  deletePage(index: number): OperationResult<void> {
    try {
      const numPages = this.lok.documentGetParts(this.docPtr);

      if (numPages <= 1) {
        return this.createErrorResult(
          'Cannot delete the last page',
          'A drawing document must have at least one page'
        );
      }

      if (index < 0 || index >= numPages) {
        return this.createErrorResult(
          `Invalid page index: ${index}`,
          `Valid range: 0-${numPages - 1}`
        );
      }

      this.lok.documentSetPart(this.docPtr, index);
      this.lok.postUnoCommand(this.docPtr, '.uno:DeletePage');

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to delete page: ${error}`);
    }
  }

  duplicatePage(index: number): OperationResult<{ newIndex: number }> {
    try {
      const numPages = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numPages) {
        return this.createErrorResult(
          `Invalid page index: ${index}`,
          `Valid range: 0-${numPages - 1}`
        );
      }

      this.lok.documentSetPart(this.docPtr, index);
      this.lok.postUnoCommand(this.docPtr, '.uno:DuplicatePage');

      return this.createResult({ newIndex: index + 1 });
    } catch (error) {
      return this.createErrorResult(`Failed to duplicate page: ${error}`);
    }
  }

  // ============================================
  // Shape operations
  // ============================================

  addShape(
    pageIndex: number,
    shapeType: ShapeType,
    bounds: Rectangle,
    options?: { text?: string; fillColor?: string; lineColor?: string }
  ): OperationResult<{ shapeIndex: number }> {
    try {
      const numPages = this.lok.documentGetParts(this.docPtr);

      if (pageIndex < 0 || pageIndex >= numPages) {
        return this.createErrorResult(`Invalid page index: ${pageIndex}`);
      }

      this.lok.documentSetPart(this.docPtr, pageIndex);

      // Map shape type to UNO command
      const shapeCommand = this.getShapeCommand(shapeType);

      // Set shape bounds
      const boundsArgs = JSON.stringify({
        X: { type: 'long', value: bounds.x },
        Y: { type: 'long', value: bounds.y },
        Width: { type: 'long', value: bounds.width },
        Height: { type: 'long', value: bounds.height },
      });

      this.lok.postUnoCommand(this.docPtr, shapeCommand, boundsArgs);

      // Set optional properties
      if (options?.text) {
        const textArgs = JSON.stringify({
          Text: { type: 'string', value: options.text },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:InsertText', textArgs);
      }

      if (options?.fillColor) {
        const colorArgs = JSON.stringify({
          FillColor: { type: 'long', value: this.hexToNumber(options.fillColor) },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:FillColor', colorArgs);
      }

      if (options?.lineColor) {
        const colorArgs = JSON.stringify({
          LineColor: { type: 'long', value: this.hexToNumber(options.lineColor) },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:XLineColor', colorArgs);
      }

      // Return approximate index (would need LOK API to get actual)
      return this.createResult({ shapeIndex: 0 });
    } catch (error) {
      return this.createErrorResult(`Failed to add shape: ${error}`);
    }
  }

  addLine(
    pageIndex: number,
    start: Position,
    end: Position,
    options?: { lineColor?: string; lineWidth?: number }
  ): OperationResult<{ shapeIndex: number }> {
    try {
      const numPages = this.lok.documentGetParts(this.docPtr);

      if (pageIndex < 0 || pageIndex >= numPages) {
        return this.createErrorResult(`Invalid page index: ${pageIndex}`);
      }

      this.lok.documentSetPart(this.docPtr, pageIndex);

      const args = JSON.stringify({
        StartX: { type: 'long', value: start.x },
        StartY: { type: 'long', value: start.y },
        EndX: { type: 'long', value: end.x },
        EndY: { type: 'long', value: end.y },
      });

      this.lok.postUnoCommand(this.docPtr, '.uno:Line', args);

      if (options?.lineColor) {
        const colorArgs = JSON.stringify({
          LineColor: { type: 'long', value: this.hexToNumber(options.lineColor) },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:XLineColor', colorArgs);
      }

      if (options?.lineWidth) {
        const widthArgs = JSON.stringify({
          LineWidth: { type: 'long', value: options.lineWidth },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:LineWidth', widthArgs);
      }

      return this.createResult({ shapeIndex: 0 });
    } catch (error) {
      return this.createErrorResult(`Failed to add line: ${error}`);
    }
  }

  deleteShape(pageIndex: number, shapeIndex: number): OperationResult<void> {
    try {
      this.lok.documentSetPart(this.docPtr, pageIndex);

      // Select shape by index (simplified - real impl would use object selection)
      this.selectShape(shapeIndex);
      this.lok.postUnoCommand(this.docPtr, '.uno:Delete');

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to delete shape: ${error}`);
    }
  }

  setShapeText(pageIndex: number, shapeIndex: number, text: string): OperationResult<void> {
    try {
      this.lok.documentSetPart(this.docPtr, pageIndex);
      this.selectShape(shapeIndex);

      // Enter edit mode for the shape
      this.lok.postUnoCommand(this.docPtr, '.uno:EnterGroup');

      // Replace text
      this.lok.postUnoCommand(this.docPtr, '.uno:SelectAll');
      const args = JSON.stringify({
        Text: { type: 'string', value: text },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertText', args);

      // Exit edit mode
      this.lok.postUnoCommand(this.docPtr, '.uno:LeaveGroup');

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to set shape text: ${error}`);
    }
  }

  moveShape(pageIndex: number, shapeIndex: number, newPosition: Position): OperationResult<void> {
    try {
      this.lok.documentSetPart(this.docPtr, pageIndex);
      this.selectShape(shapeIndex);

      const args = JSON.stringify({
        X: { type: 'long', value: newPosition.x },
        Y: { type: 'long', value: newPosition.y },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:SetObjectPosition', args);

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to move shape: ${error}`);
    }
  }

  resizeShape(pageIndex: number, shapeIndex: number, newSize: Size): OperationResult<void> {
    try {
      this.lok.documentSetPart(this.docPtr, pageIndex);
      this.selectShape(shapeIndex);

      const args = JSON.stringify({
        Width: { type: 'long', value: newSize.width },
        Height: { type: 'long', value: newSize.height },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:Size', args);

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to resize shape: ${error}`);
    }
  }

  // ============================================
  // Private helpers
  // ============================================

  private getPageInfoInternal(index: number): PageInfo {
    this.lok.documentSetPart(this.docPtr, index);
    const size = this.lok.documentGetDocumentSize(this.docPtr);
    const shapes = this.getShapesOnPage();

    return {
      index,
      shapeCount: shapes.length,
      size: { width: size.width, height: size.height },
    };
  }

  private getShapesOnPage(): ShapeData[] {
    // In a real implementation, we'd enumerate shapes via LOK
    // For now, we parse text content as a simple proxy
    const text = this.lok.getAllText(this.docPtr) || '';

    if (!text.trim()) {
      return [];
    }

    // Return a single text shape if there's content
    return [{
      index: 0,
      type: 'text',
      text,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    }];
  }

  private selectShape(shapeIndex: number): void {
    // Navigate to shape - simplified implementation
    // Real implementation would use object enumeration
    const args = JSON.stringify({
      Index: { type: 'long', value: shapeIndex },
    });
    this.lok.postUnoCommand(this.docPtr, '.uno:SelectObject', args);
  }

  private getShapeCommand(shapeType: ShapeType): string {
    const commands: Record<ShapeType, string> = {
      rectangle: '.uno:Rect',
      ellipse: '.uno:Ellipse',
      line: '.uno:Line',
      text: '.uno:Text',
      image: '.uno:InsertGraphic',
      group: '.uno:FormatGroup',
      other: '.uno:Rect', // Default to rectangle
    };
    return commands[shapeType];
  }

  private hexToNumber(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }
}
