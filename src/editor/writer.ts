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

  insertText(text: string, _position: TextPosition): OperationResult<void> {
    try {
      // TODO: Navigate to position using cursor before inserting
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

  deleteText(_start: TextPosition, _end: TextPosition): OperationResult<{ deleted: string }> {
    try {
      // TODO: Use start/end to select text range before deleting
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

  formatText(_range: TextRange, format: TextFormat): OperationResult<void> {
    try {
      // TODO: Use range to select text before applying format
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

  /**
   * Get the text formatting at the current selection or cursor position.
   *
   * Uses LOK callback mechanism to retrieve STATE_CHANGED events which contain
   * formatting state like `.uno:Bold=true`, `.uno:Italic=false`, etc.
   *
   * @param _position - Text position (currently unused, uses current selection)
   * @returns TextFormat with bold, italic, underline, fontSize, fontName properties
   */
  getFormat(_position?: TextPosition): OperationResult<TextFormat> {
    try {
      // Clear any existing callback events
      this.lok.clearCallbackQueue();

      // Trigger a selection change to get current formatting state
      // Moving cursor slightly and back triggers STATE_CHANGED callbacks
      this.lok.postUnoCommand(this.docPtr, '.uno:CharRightSel');
      this.lok.flushCallbacks(this.docPtr);
      this.lok.postUnoCommand(this.docPtr, '.uno:CharLeft');
      this.lok.flushCallbacks(this.docPtr);

      // Poll STATE_CHANGED events to get formatting state
      const states = this.lok.pollStateChanges();

      // Parse the state values into TextFormat
      const format: TextFormat = {};

      // Bold: .uno:Bold=true or .uno:Bold=false
      const boldState = states.get('.uno:Bold');
      if (boldState !== undefined) {
        format.bold = boldState === 'true';
      }

      // Italic: .uno:Italic=true or .uno:Italic=false
      const italicState = states.get('.uno:Italic');
      if (italicState !== undefined) {
        format.italic = italicState === 'true';
      }

      // Underline: .uno:Underline=true or .uno:Underline=false
      const underlineState = states.get('.uno:Underline');
      if (underlineState !== undefined) {
        format.underline = underlineState === 'true';
      }

      // Font size: .uno:FontHeight=12
      const fontSizeState = states.get('.uno:FontHeight');
      if (fontSizeState !== undefined) {
        const size = parseFloat(fontSizeState);
        if (!isNaN(size)) {
          format.fontSize = size;
        }
      }

      // Font name: .uno:CharFontName=Arial
      const fontNameState = states.get('.uno:CharFontName');
      if (fontNameState !== undefined && fontNameState.length > 0) {
        format.fontName = fontNameState;
      }

      return this.createResult(format);
    } catch (error) {
      return this.createErrorResult(`Failed to get format: ${error}`);
    }
  }

  /**
   * Get formatting state for the current selection using the callback mechanism.
   * This is the preferred way to get character formatting as it uses LOK's
   * STATE_CHANGED callback events.
   *
   * @returns Map of UNO command names to their state values
   */
  getSelectionFormat(): OperationResult<Map<string, string>> {
    try {
      // Poll any existing STATE_CHANGED events (from previous operations)
      const existingStates = this.lok.pollStateChanges();

      if (existingStates.size === 0) {
        // No existing states, trigger a selection to get current format
        this.lok.clearCallbackQueue();
        this.lok.postUnoCommand(this.docPtr, '.uno:SelectWord');
        this.lok.flushCallbacks(this.docPtr);
        const states = this.lok.pollStateChanges();
        return this.createResult(states);
      }

      return this.createResult(existingStates);
    } catch (error) {
      return this.createErrorResult(`Failed to get selection format: ${error}`);
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
