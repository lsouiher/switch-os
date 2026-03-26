'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

export default function Notepad({ windowId }: { windowId: string }) {
  const windowState = useSimulationStore((s) => s.windowManager.windows[windowId]);
  const fileSystem = useSimulationStore((s) => s.fileSystem);
  const setFileContent = useSimulationStore((s) => s.setFileContent);
  const updateWindowTitle = useSimulationStore((s) => s.updateWindowTitle);
  const recordAction = useSimulationStore((s) => s.recordAction);

  const fileId = windowState?.meta?.fileId as string | undefined;
  const file = fileId ? fileSystem.nodes[fileId] : null;

  const [content, setContent] = useState(file?.content || '');
  const [modified, setModified] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

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
      target: { elementId: windowId, elementType: 'notepad' },
      data: { text: e.target.value },
    });
  };

  const handleSave = () => {
    if (fileId) {
      setFileContent(fileId, content);
      setModified(false);
    }
  };

  useEffect(() => {
    const title = file?.name || 'Untitled';
    updateWindowTitle(windowId, modified ? `*${title} - Notepad` : `${title} - Notepad`);
  }, [modified, file?.name, windowId, updateWindowTitle]);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: '"Segoe UI", sans-serif' }}>
      {/* Menu bar */}
      <div className="flex items-center h-7 border-b border-gray-200 bg-white text-[12px]">
        <button className="px-3 py-0.5 hover:bg-gray-100 text-gray-700">File</button>
        <button className="px-3 py-0.5 hover:bg-gray-100 text-gray-700">Edit</button>
        <button
          className={`px-3 py-0.5 hover:bg-gray-100 text-gray-700`}
          onClick={() => setWordWrap(!wordWrap)}
        >
          Format
        </button>
        <button className="px-3 py-0.5 hover:bg-gray-100 text-gray-700">View</button>
        <button className="px-3 py-0.5 hover:bg-gray-100 text-gray-700">Help</button>

        <div className="flex-1" />
        {modified && (
          <button
            onClick={handleSave}
            className="px-2 py-0.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded mr-2"
          >
            Save
          </button>
        )}
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 p-2 resize-none outline-none text-sm leading-relaxed"
        style={{
          fontFamily: '"Consolas", "Courier New", monospace',
          fontSize: '14px',
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowWrap: wordWrap ? 'break-word' : 'normal',
        }}
        placeholder="Start typing..."
        spellCheck={false}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-0.5 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500">
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
