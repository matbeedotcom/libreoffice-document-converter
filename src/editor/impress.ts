// src/editor/impress.ts
import { OfficeEditor } from './base.js';
import type {
  OperationResult,
  ImpressStructure,
  SlideData,
  SlideInfo,
  SlideLayout,
  TextFrame,
} from './types.js';

/**
 * Editor for Impress (presentation) documents
 */
export class ImpressEditor extends OfficeEditor {
  getDocumentType(): 'impress' {
    return 'impress';
  }

  getStructure(_options?: { maxResponseChars?: number }): OperationResult<ImpressStructure> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);
      const slides: SlideInfo[] = [];

      for (let i = 0; i < numSlides; i++) {
        const slideData = this.getSlideInfoInternal(i);
        slides.push(slideData);
      }

      const structure: ImpressStructure = {
        type: 'impress',
        slides,
        slideCount: numSlides,
      };

      return this.createResult(structure);
    } catch (error) {
      return this.createErrorResult(`Failed to get structure: ${String(error)}`);
    }
  }

  // ============================================
  // Slide reading
  // ============================================

  getSlide(index: number): OperationResult<SlideData> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numSlides) {
        return this.createErrorResult(
          `Invalid slide index: ${index}. Valid range: 0-${numSlides - 1}`,
          'Use getStructure() to see available slides'
        );
      }

      this.lok.documentSetPart(this.docPtr, index);
      const text = this.lok.getAllText(this.docPtr) || '';
      const textFrames = this.parseTextFrames(text);

      const slideData: SlideData = {
        index,
        title: textFrames.find(f => f.type === 'title')?.text,
        textFrames,
        hasNotes: false, // Could detect from LOK if available
      };

      return this.createResult(slideData);
    } catch (error) {
      return this.createErrorResult(`Failed to get slide: ${String(error)}`);
    }
  }

  getSlideCount(): OperationResult<number> {
    try {
      const count = this.lok.documentGetParts(this.docPtr);
      return this.createResult(count);
    } catch (error) {
      return this.createErrorResult(`Failed to get slide count: ${String(error)}`);
    }
  }

  // ============================================
  // Slide management
  // ============================================

  addSlide(options?: { afterSlide?: number; layout?: SlideLayout }): OperationResult<{ index: number }> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      // Navigate to position if specified
      if (options?.afterSlide !== undefined) {
        this.lok.documentSetPart(this.docPtr, options.afterSlide);
      } else {
        // Go to last slide
        this.lok.documentSetPart(this.docPtr, numSlides - 1);
      }

      // Insert new slide
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertPage');

      // Apply layout if specified
      if (options?.layout) {
        this.applySlideLayout(options.layout);
      }

      const newIndex = options?.afterSlide !== undefined
        ? options.afterSlide + 1
        : numSlides;

      // Verify by checking slide count increased
      const newNumSlides = this.lok.documentGetParts(this.docPtr);
      const verified = newNumSlides > numSlides;

      return {
        success: true,
        verified,
        data: { index: newIndex },
      };
    } catch (error) {
      return this.createErrorResult(`Failed to add slide: ${String(error)}`);
    }
  }

  deleteSlide(index: number): OperationResult<void> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (numSlides <= 1) {
        return this.createErrorResult(
          'Cannot delete the last slide',
          'A presentation must have at least one slide'
        );
      }

      if (index < 0 || index >= numSlides) {
        return this.createErrorResult(
          `Invalid slide index: ${index}`,
          `Valid range: 0-${numSlides - 1}`
        );
      }

      this.lok.documentSetPart(this.docPtr, index);
      this.lok.postUnoCommand(this.docPtr, '.uno:DeletePage');

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to delete slide: ${String(error)}`);
    }
  }

  duplicateSlide(index: number): OperationResult<{ newIndex: number }> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numSlides) {
        return this.createErrorResult(
          `Invalid slide index: ${index}`,
          `Valid range: 0-${numSlides - 1}`
        );
      }

      this.lok.documentSetPart(this.docPtr, index);
      this.lok.postUnoCommand(this.docPtr, '.uno:DuplicatePage');

      return this.createResult({ newIndex: index + 1 });
    } catch (error) {
      return this.createErrorResult(`Failed to duplicate slide: ${String(error)}`);
    }
  }

  moveSlide(fromIndex: number, toIndex: number): OperationResult<void> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (fromIndex < 0 || fromIndex >= numSlides || toIndex < 0 || toIndex >= numSlides) {
        return this.createErrorResult(
          `Invalid slide indices. Valid range: 0-${numSlides - 1}`,
          'Check slide indices are within bounds'
        );
      }

      if (fromIndex === toIndex) {
        return this.createErrorResult(
          'Source and destination are the same',
          'Provide different indices to move'
        );
      }

      // LOK doesn't have direct slide move - we simulate via cut/paste
      this.lok.documentSetPart(this.docPtr, fromIndex);

      const args = JSON.stringify({
        Position: { type: 'long', value: toIndex },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:MovePageFirst', args);

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to move slide: ${String(error)}`);
    }
  }

  // ============================================
  // Slide content editing
  // ============================================

  setSlideTitle(index: number, title: string): OperationResult<{ oldTitle?: string }> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numSlides) {
        return this.createErrorResult(`Invalid slide index: ${index}`);
      }

      this.lok.documentSetPart(this.docPtr, index);

      // Get current title
      const text = this.lok.getAllText(this.docPtr) || '';
      const frames = this.parseTextFrames(text);
      const oldTitle = frames.find(f => f.type === 'title')?.text;

      // Select title placeholder and replace
      this.lok.postUnoCommand(this.docPtr, '.uno:SelectAll');

      // Enter title text (this replaces first text frame typically)
      const args = JSON.stringify({
        Text: { type: 'string', value: title },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertText', args);

      return this.createResult({ oldTitle });
    } catch (error) {
      return this.createErrorResult(`Failed to set slide title: ${String(error)}`);
    }
  }

  setSlideBody(index: number, body: string): OperationResult<{ oldBody?: string }> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numSlides) {
        return this.createErrorResult(`Invalid slide index: ${index}`);
      }

      this.lok.documentSetPart(this.docPtr, index);

      // Get current body
      const text = this.lok.getAllText(this.docPtr) || '';
      const frames = this.parseTextFrames(text);
      const oldBody = frames.find(f => f.type === 'body')?.text;

      // Navigate to body and replace
      // Using Tab to move from title to body placeholder
      this.lok.postUnoCommand(this.docPtr, '.uno:NextObject');

      const args = JSON.stringify({
        Text: { type: 'string', value: body },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertText', args);

      return this.createResult({ oldBody });
    } catch (error) {
      return this.createErrorResult(`Failed to set slide body: ${String(error)}`);
    }
  }

  setSlideNotes(index: number, notes: string): OperationResult<void> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numSlides) {
        return this.createErrorResult(`Invalid slide index: ${index}`);
      }

      this.lok.documentSetPart(this.docPtr, index);

      // Switch to notes view and insert text
      this.lok.postUnoCommand(this.docPtr, '.uno:NotesMode');

      const args = JSON.stringify({
        Text: { type: 'string', value: notes },
      });
      this.lok.postUnoCommand(this.docPtr, '.uno:InsertText', args);

      // Switch back to normal view
      this.lok.postUnoCommand(this.docPtr, '.uno:NormalViewMode');

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to set slide notes: ${String(error)}`);
    }
  }

  // ============================================
  // Slide layout
  // ============================================

  setSlideLayout(index: number, layout: SlideLayout): OperationResult<void> {
    try {
      const numSlides = this.lok.documentGetParts(this.docPtr);

      if (index < 0 || index >= numSlides) {
        return this.createErrorResult(`Invalid slide index: ${index}`);
      }

      this.lok.documentSetPart(this.docPtr, index);
      this.applySlideLayout(layout);

      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Failed to set slide layout: ${String(error)}`);
    }
  }

  // ============================================
  // Private helpers
  // ============================================

  private getSlideInfoInternal(index: number): SlideInfo {
    this.lok.documentSetPart(this.docPtr, index);

    const text = this.lok.getAllText(this.docPtr) || '';
    const frames = this.parseTextFrames(text);
    const titleFrame = frames.find(f => f.type === 'title');

    return {
      index,
      title: titleFrame?.text,
      layout: this.detectLayout(frames),
      textFrameCount: frames.length,
    };
  }

  private parseTextFrames(text: string): TextFrame[] {
    // Parse text content into frames
    // In Impress, text is typically separated by paragraph breaks
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    const frames: TextFrame[] = [];

    paragraphs.forEach((para, idx) => {
      const type = idx === 0 ? 'title' : (idx === 1 ? 'body' : 'other');
      frames.push({
        index: idx,
        type: type as TextFrame['type'],
        text: para.trim(),
        bounds: { x: 0, y: 0, width: 0, height: 0 }, // Would need LOK API for actual bounds
      });
    });

    return frames;
  }

  private detectLayout(frames: TextFrame[]): SlideLayout {
    if (frames.length === 0) return 'blank';
    if (frames.length === 1 && frames[0]?.type === 'title') return 'title';
    if (frames.length >= 2) return 'titleContent';
    return 'blank';
  }

  private applySlideLayout(layout: SlideLayout): void {
    // Map layout names to LOK layout IDs
    const layoutMap: Record<SlideLayout, number> = {
      blank: 0,
      title: 1,
      titleContent: 2,
      twoColumn: 3,
    };

    const layoutId = layoutMap[layout] ?? 0;
    const args = JSON.stringify({
      WhatLayout: { type: 'long', value: layoutId },
    });
    this.lok.postUnoCommand(this.docPtr, '.uno:AssignLayout', args);
  }
}
