'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

export default function TextEdit({ windowId }: { windowId: string }) {
  const windowState = useSimulationStore((s) => s.windowManager.windows[windowId]);
  const fileSystem = useSimulationStore((s) => s.fileSystem);
  const setFileContent = useSimulationStore((s) => s.setFileContent);
  const updateWindowTitle = useSimulationStore((s) => s.updateWindowTitle);
  const recordAction = useSimulationStore((s) => s.recordAction);

  const fileId = windowState?.meta?.fileId as string | undefined;
  const file = fileId ? fileSystem.nodes[fileId] : null;

  const [content, setContent] = useState(file?.content || '');
  const [modified, setModified] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setModified(false);
    }
  }, [fileId]);

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
    updateWindowTitle(windowId, modified ? `${title} — Edited` : title);
  }, [modified, file?.name, windowId, updateWindowTitle]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-gray-50/50 text-xs">
        <button
          onClick={handleSave}
          disabled={!modified || !fileId}
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-30 text-xs"
        >
          Save
        </button>
        {modified && <span className="text-orange-500 text-[10px]">Unsaved changes</span>}
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 p-4 resize-none outline-none text-sm leading-relaxed"
        style={{
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontSize: '13px',
        }}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  );
}
