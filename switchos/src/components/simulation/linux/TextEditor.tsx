'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

export default function TextEditor({ windowId }: { windowId: string }) {
  const windowState = useSimulationStore((s) => s.windowManager.windows[windowId]);
  const fileSystem = useSimulationStore((s) => s.fileSystem);
  const setFileContent = useSimulationStore((s) => s.setFileContent);
  const updateWindowTitle = useSimulationStore((s) => s.updateWindowTitle);
  const recordAction = useSimulationStore((s) => s.recordAction);

  const fileId = windowState?.meta?.fileId as string | undefined;
  const file = fileId ? fileSystem.nodes[fileId] : null;
  const prevFileIdRef = useRef(fileId);

  const [content, setContent] = useState(file?.content || '');
  const [modified, setModified] = useState(false);

  if (prevFileIdRef.current !== fileId) {
    prevFileIdRef.current = fileId;
    if (file) {
      setContent(file.content);
      setModified(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setModified(true);
    recordAction({
      type: 'type',
      target: { elementId: windowId, elementType: 'textedit' },
      data: { text: e.target.value },
    });
  };

  const handleSave = () => {
    if (fileId) {
      setFileContent(fileId, content);
      setModified(false);
      updateWindowTitle(windowId, file?.name || 'Untitled');
    }
  };

  useEffect(() => {
    const title = file?.name || 'Untitled';
    updateWindowTitle(windowId, modified ? `*${title}` : title);
  }, [modified, file?.name, windowId, updateWindowTitle]);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: '"Ubuntu", "Cantarell", sans-serif' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2d2d2d] bg-[#353535] text-xs">
        <button
          onClick={handleSave}
          disabled={!modified || !fileId}
          className="px-3 py-1 bg-[#e95420] hover:bg-[#c74516] text-white rounded disabled:opacity-30 text-xs"
        >
          Save
        </button>
        {modified && <span className="text-[#e95420] text-[10px]">Unsaved changes</span>}
        <div className="flex-1" />
        {file && (
          <span className="text-gray-400 text-[10px]">{file.name}</span>
        )}
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 p-4 resize-none outline-none text-sm leading-relaxed bg-[#383838] text-gray-200"
        style={{
          fontFamily: '"Ubuntu Mono", "DejaVu Sans Mono", monospace',
          fontSize: '13px',
        }}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  );
}
