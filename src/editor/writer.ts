// src/editor/writer.ts
import { OfficeEditor } from './base.js';
import type {
  OperationResult,
  WriterStructure,
  Paragraph,
  TextPosition,
  TextRange,
  TextFormat,
} from './types.js';

/**
 * Editor for Writer (text) documents
 */
export class WriterEditor extends OfficeEditor {
  private cachedParagraphs: string[] | null = null;

  getDocumentType(): 'writer' {
    return 'writer';
  }

  getStructure(options?: { maxResponseChars?: number }): OperationResult<WriterStructure> {
    try {
      const paragraphs = this.getParagraphsInternal();
      const maxChars = options?.maxResponseChars ?? this.options.maxResponseChars;

      const paragraphInfos = paragraphs.map((text, index) => ({
        index,
        preview: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
        style: 'Normal', // Would need UNO query to get actual style
        charCount: text.length,
      }));

      // Truncate if needed
      const truncResult = this.truncateArray(
        paragraphInfos,
        maxChars,
        (p) => JSON.stringify(p)
      );

      const structure: WriterStructure = {
        type: 'writer',
        paragraphs: truncResult.items,
        pageCount: this.lok.documentGetParts(this.docPtr),
        wordCount: paragraphs.join(' ').split(/\s+/).filter(w => w.length > 0).length,
      };

      if (truncResult.truncated) {
        return this.createResultWithTruncation(structure, {
          original: truncResult.original,
          returned: truncResult.returned,
          message: `Showing ${truncResult.returned} of ${truncResult.original} paragraphs. Use getParagraphs(start, count) to paginate.`,
        });
      }

      return this.createResult(structure);
    } catch (error) {
      return this.createErrorResult(`Failed to get structure: ${error}`);
    }
  }

  getParagraph(index: number): OperationResult<Paragraph> {
    try {
      const paragraphs = this.getParagraphsInternal();

      if (index < 0 || index >= paragraphs.length) {
        return this.createErrorResult(
          `Paragraph index ${index} out of range (0-${paragraphs.length - 1})`,
          `Use getStructure() to see available paragraphs`
        );
      }

      const text = paragraphs[index]!;
      return this.createResult({
        index,
        text,
        style: 'Normal',
        charCount: text.length,
      });
    } catch (error) {
      return this.createErrorResult(`Failed to get paragraph: ${error}`);
    }
  }

  getParagraphs(start: number, count: number): OperationResult<Paragraph[]> {
    try {
      const paragraphs = this.getParagraphsInternal();

      if (start < 0 || start >= paragraphs.length) {
        return this.createErrorResult(
          `Start index ${start} out of range`,
          `Valid range: 0-${paragraphs.length - 1}`
        );
      }

      const end = Math.min(start + count, paragraphs.length);
      const result = paragraphs.slice(start, end).map((text, i) => ({
        index: start + i,
        text,
        style: 'Normal',
        charCount: text.length,
      }));

      return this.createResult(result);
    } catch (error) {
      return this.createErrorResult(`Failed to get paragraphs: ${error}`);
    }
  }

  insertParagraph(text: string, options?: {
    afterIndex?: number;
    style?: 'Normal' | 'Heading 1' | 'Heading 2' | 'Heading 3' | 'List';
  }): OperationResult<{ index: number }> {
    try {
      const paragraphs = this.getParagraphsInternal();
      const insertIndex = options?.afterIndex !== undefined
        ? options.afterIndex + 1
        : paragraphs.length;

      // Move to end of target paragraph or document end
      if (insertIndex > 0 && insertIndex <= paragraphs.length) {
        // Navigate to position
        this.lok.postUnoCommand(this.docPtr, '.uno:GoToEndOfDoc');
      }

      // Insert paragraph break and text
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertPara');

      // Insert the text
      const textArgs = JSON.stringify({
        Text: { type: 'string', value: text },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertText', textArgs);

      // Apply style if specified
      if (options?.style && options.style !== 'Normal') {
        const styleMap: Record<string, string> = {
          'Heading 1': 'Heading 1',
          'Heading 2': 'Heading 2',
          'Heading 3': 'Heading 3',
          'List': 'List',
        };
        const styleName = styleMap[options.style];
        if (styleName) {
          const styleArgs = JSON.stringify({
            Template: { type: 'string', value: styleName },
            Family: { type: 'short', value: 2 }, // Paragraph styles
          });
          this.lok.postUnoCommand(this.docPtr, '.uno:StyleApply', styleArgs);
        }
      }

      // Invalidate cache
      this.cachedParagraphs = null;

      // Verify by re-reading
      const newParagraphs = this.getParagraphsInternal();
      const verified = newParagraphs.length > paragraphs.length;

      return {
        success: true,
        verified,
        data: { index: insertIndex },
      };
    } catch (error) {
      return this.createErrorResult(`Failed to insert paragraph: ${error}`);
    }
  }

  replaceParagraph(index: number, text: string): OperationResult<{ oldText: string }> {
    try {
      const paragraphs = this.getParagraphsInternal();

      if (index < 0 || index >= paragraphs.length) {
        return this.createErrorResult(
          `Paragraph index ${index} out of range`,
          `Valid range: 0-${paragraphs.length - 1}`
        );
      }

      const oldText = paragraphs[index]!;

      // Select the paragraph and replace
      // This is a simplified implementation - full implementation would use cursor positioning
      const findReplaceArgs = JSON.stringify({
        'SearchItem.SearchString': { type: 'string', value: oldText },
        'SearchItem.ReplaceString': { type: 'string', value: text },
        'SearchItem.Command': { type: 'long', value: 2 }, // Replace
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:ExecuteSearch', findReplaceArgs);

      // Invalidate cache
      this.cachedParagraphs = null;

      return this.createResult({ oldText });
    } catch (error) {
      return this.createErrorResult(`Failed to replace paragraph: ${error}`);
    }
  }

  deleteParagraph(index: number): OperationResult<{ deletedText: string }> {
    try {
      const paragraphs = this.getParagraphsInternal();

      if (index < 0 || index >= paragraphs.length) {
        return this.createErrorResult(
          `Paragraph index ${index} out of range`,
          `Valid range: 0-${paragraphs.length - 1}`
        );
      }

      const deletedText = paragraphs[index]!;

      // Replace with empty string
      const result = this.replaceParagraph(index, '');
      if (!result.success) {
        return this.createErrorResult(result.error || 'Failed to delete');
      }

      return this.createResult({ deletedText });
    } catch (error) {
      return this.createErrorResult(`Failed to delete paragraph: ${error}`);
    }
  }

  insertText(text: string, position: TextPosition): OperationResult<void> {
    try {
      // Navigate to position (simplified - full impl would use cursor)
      const textArgs = JSON.stringify({
        Text: { type: 'string', value: text },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertText', textArgs);

      this.cachedParagraphs = null;
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to insert text: ${error}`);
    }
  }

  deleteText(start: TextPosition, end: TextPosition): OperationResult<{ deleted: string }> {
    try {
      // Get current selection
      const selection = this.lok.getTextSelection(this.docPtr, 'text/plain');

      // Delete selection
      this.lok.postUnoCommand(this.docPtr, '.uno:Delete');

      this.cachedParagraphs = null;
      return this.createResult({ deleted: selection || '' });
    } catch (error) {
      return this.createErrorResult(`Failed to delete text: ${error}`);
    }
  }

  replaceText(find: string, replace: string, options?: {
    paragraph?: number;
    all?: boolean;
  }): OperationResult<{ replacements: number }> {
    try {
      const command = options?.all ? 3 : 2; // 3 = Replace All, 2 = Replace

      const searchArgs = JSON.stringify({
        'SearchItem.SearchString': { type: 'string', value: find },
        'SearchItem.ReplaceString': { type: 'string', value: replace },
        'SearchItem.Command': { type: 'long', value: command },
      });

      this.lok.postUnoCommand(this.docPtr, '.uno:ExecuteSearch', searchArgs);

      this.cachedParagraphs = null;

      // LOK doesn't return count, we indicate success
      return this.createResult({ replacements: -1 });
    } catch (error) {
      return this.createErrorResult(`Failed to replace text: ${error}`);
    }
  }

  formatText(range: TextRange, format: TextFormat): OperationResult<void> {
    try {
      // Apply formatting commands
      if (format.bold !== undefined) {
        this.lok.postUnoCommand(this.docPtr, '.uno:Bold');
      }
      if (format.italic !== undefined) {
        this.lok.postUnoCommand(this.docPtr, '.uno:Italic');
      }
      if (format.underline !== undefined) {
        this.lok.postUnoCommand(this.docPtr, '.uno:Underline');
      }
      if (format.fontSize !== undefined) {
        const args = JSON.stringify({
          FontHeight: { type: 'float', value: format.fontSize },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:FontHeight', args);
      }
      if (format.fontName !== undefined) {
        const args = JSON.stringify({
          CharFontName: { type: 'string', value: format.fontName },
        });
        this.lok.postUnoCommand(this.docPtr, '.uno:CharFontName', args);
      }

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to format text: ${error}`);
    }
  }

  getFormat(position: TextPosition): OperationResult<TextFormat> {
    try {
      // Query current formatting
      const result = this.lok.getCommandValues(this.docPtr, '.uno:CharFontName');

      // Parse result (simplified)
      return this.createResult({
        bold: false,
        italic: false,
        underline: false,
      });
    } catch (error) {
      return this.createErrorResult(`Failed to get format: ${error}`);
    }
  }

  // ============================================
  // Private helpers
  // ============================================

  private getParagraphsInternal(): string[] {
    if (this.cachedParagraphs) {
      return this.cachedParagraphs;
    }

    const allText = this.lok.getAllText(this.docPtr);
    if (!allText) {
      return [];
    }

    // Split by double newlines (paragraph breaks) or single newlines
    this.cachedParagraphs = allText
      .split(/\n\n|\r\n\r\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return this.cachedParagraphs;
  }
}
