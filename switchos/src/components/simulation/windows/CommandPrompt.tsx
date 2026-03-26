'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { OS_CONFIGS } from '@/simulation/osConfig';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

export default function CommandPrompt({ windowId }: { windowId: string }) {
  const formatPath = OS_CONFIGS.windows.formatDisplayPath;

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: 'Microsoft Windows [Version 10.0.22631]' },
    { type: 'output', text: '(c) Microsoft Corporation. All rights reserved.\n' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/Users/you');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getNodeByPath = useSimulationStore((s) => s.getNodeByPath);
  const getChildren = useSimulationStore((s) => s.getChildren);
  const createFileFn = useSimulationStore((s) => s.createFile);
  const createFolderFn = useSimulationStore((s) => s.createFolder);
  const deleteNode = useSimulationStore((s) => s.deleteNode);
  const moveNode = useSimulationStore((s) => s.moveNode);
  const copyNode = useSimulationStore((s) => s.copyNode);
  const recordAction = useSimulationStore((s) => s.recordAction);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const resolvePath = (path: string): string => {
    let normalized = path.replace(/\\/g, '/');
    if (normalized.match(/^[A-Z]:/i)) {
      normalized = normalized.slice(2);
    }
    if (normalized.startsWith('/')) return normalized;
    const parts = cwd.split('/').filter(Boolean);
    for (const part of normalized.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    return '/' + parts.join('/');
  };

  const prompt = `${formatPath(cwd)}>`;

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLines: TerminalLine[] = [
      ...lines,
      { type: 'input', text: `${prompt}${trimmed}` },
    ];

    const [command, ...args] = trimmed.split(/\s+/);
    const lcmd = command.toLowerCase();

    recordAction({
      type: 'type',
      target: { elementType: 'cmd' },
      data: { text: trimmed },
    });

    switch (lcmd) {
      case 'dir': {
        const path = resolvePath(args[0] || '.');
        const node = getNodeByPath(path);
        if (!node) {
          newLines.push({ type: 'error', text: `The system cannot find the path specified.` });
        } else {
          const children = getChildren(node.id);
          newLines.push({ type: 'output', text: ` Directory of ${formatPath(path)}\n` });
          for (const c of children) {
            const type = c.type === 'folder' ? '<DIR>' : '     ';
            const size = c.type === 'folder' ? '' : String(c.size).padStart(14);
            newLines.push({ type: 'output', text: `01/01/2026  12:00 AM    ${type} ${size} ${c.name}` });
          }
          const dirs = children.filter((c) => c.type === 'folder').length;
          const files = children.length - dirs;
          newLines.push({ type: 'output', text: `               ${files} File(s)` });
          newLines.push({ type: 'output', text: `               ${dirs} Dir(s)` });
        }
        break;
      }
      case 'cd': {
        if (!args[0]) {
          newLines.push({ type: 'output', text: formatPath(cwd) });
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `The system cannot find the path specified.` });
          } else if (node.type !== 'folder') {
            newLines.push({ type: 'error', text: `The directory name is invalid.` });
          } else {
            setCwd(path);
          }
        }
        break;
      }
      case 'mkdir':
      case 'md': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'The syntax of the command is incorrect.' });
        } else {
          const parent = getNodeByPath(cwd);
          if (parent) createFolderFn(parent.id, args[0]);
        }
        break;
      }
      case 'del': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'The syntax of the command is incorrect.' });
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `Could Not Find ${args[0]}` });
          } else {
            deleteNode(node.id);
          }
        }
        break;
      }
      case 'copy': {
        if (args.length < 2) {
          newLines.push({ type: 'error', text: 'The syntax of the command is incorrect.' });
        } else {
          const src = getNodeByPath(resolvePath(args[0]));
          const dest = getNodeByPath(resolvePath(args[1]));
          if (!src) {
            newLines.push({ type: 'error', text: `The system cannot find the file specified.` });
          } else if (!dest || dest.type !== 'folder') {
            newLines.push({ type: 'error', text: `The system cannot find the path specified.` });
          } else {
            copyNode(src.id, dest.id);
            newLines.push({ type: 'output', text: '        1 file(s) copied.' });
          }
        }
        break;
      }
      case 'move': {
        if (args.length < 2) {
          newLines.push({ type: 'error', text: 'The syntax of the command is incorrect.' });
        } else {
          const src = getNodeByPath(resolvePath(args[0]));
          const dest = getNodeByPath(resolvePath(args[1]));
          if (!src) {
            newLines.push({ type: 'error', text: `The system cannot find the file specified.` });
          } else if (!dest || dest.type !== 'folder') {
            newLines.push({ type: 'error', text: `The system cannot find the path specified.` });
          } else {
            moveNode(src.id, dest.id);
            newLines.push({ type: 'output', text: '        1 file(s) moved.' });
          }
        }
        break;
      }
      case 'type': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'The syntax of the command is incorrect.' });
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `The system cannot find the file specified.` });
          } else if (node.type !== 'file') {
            newLines.push({ type: 'error', text: `Access is denied.` });
          } else {
            newLines.push({ type: 'output', text: node.content || '' });
          }
        }
        break;
      }
      case 'echo':
        newLines.push({ type: 'output', text: args.join(' ') });
        break;
      case 'cls':
        setLines([]);
        setInput('');
        setCmdHistory([...cmdHistory, trimmed]);
        setHistoryIdx(-1);
        return;
      case 'help':
        newLines.push({
          type: 'output',
          text: 'Available commands: DIR, CD, MKDIR (MD), DEL, COPY, MOVE, TYPE, ECHO, CLS, HELP',
        });
        break;
      default:
        newLines.push({ type: 'error', text: `'${command}' is not recognized as an internal or external command,\noperable program or batch file.` });
    }

    setLines(newLines);
    setInput('');
    setCmdHistory([...cmdHistory, trimmed]);
    setHistoryIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      if (cmdHistory[newIdx]) {
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full cursor-text"
      style={{
        background: '#0c0c0c',
        fontFamily: '"Consolas", "Courier New", monospace',
        fontSize: '14px',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-auto p-3">
        {lines.map((line, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap"
            style={{
              color: line.type === 'error' ? '#f87171' : '#cccccc',
            }}
          >
            {line.text}
          </div>
        ))}

        <div className="flex items-center">
          <span style={{ color: '#cccccc' }}>{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none"
            style={{ color: '#cccccc', caretColor: '#cccccc' }}
            spellCheck={false}
            autoFocus
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
