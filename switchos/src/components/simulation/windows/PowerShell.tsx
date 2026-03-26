'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { OS_CONFIGS } from '@/simulation/osConfig';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

export default function PowerShell({ windowId }: { windowId: string }) {
  const formatPath = OS_CONFIGS.windows.formatDisplayPath;

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: 'Windows PowerShell' },
    { type: 'output', text: 'Copyright (C) Microsoft Corporation. All rights reserved.\n' },
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
    // Handle Windows-style paths by converting to internal format
    let normalized = path.replace(/\\/g, '/');
    if (normalized.match(/^[A-Z]:/i)) {
      normalized = normalized.slice(2); // Remove C: prefix
    }
    if (normalized.startsWith('/')) return normalized;
    if (normalized.startsWith('~')) return '/Users/you' + normalized.slice(1);
    const parts = cwd.split('/').filter(Boolean);
    for (const part of normalized.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    return '/' + parts.join('/');
  };

  const prompt = `PS ${formatPath(cwd)}> `;

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
      target: { elementType: 'powershell' },
      data: { text: trimmed },
    });

    // PowerShell aliases
    const cmdMap: Record<string, string> = {
      dir: 'ls', type: 'cat', del: 'rm', copy: 'cp', move: 'mv',
      cls: 'clear', 'get-childitem': 'ls', 'get-content': 'cat',
      'remove-item': 'rm', 'copy-item': 'cp', 'move-item': 'mv',
      'new-item': 'touch', 'get-location': 'pwd', 'set-location': 'cd',
    };
    const resolved = cmdMap[lcmd] || lcmd;

    switch (resolved) {
      case 'ls': {
        const path = resolvePath(args[0] || '.');
        const node = getNodeByPath(path);
        if (!node) {
          newLines.push({ type: 'error', text: `Get-ChildItem : Cannot find path '${formatPath(path)}'` });
        } else if (node.type !== 'folder') {
          newLines.push({ type: 'output', text: node.name });
        } else {
          const children = getChildren(node.id);
          newLines.push({ type: 'output', text: '\n    Directory: ' + formatPath(path) + '\n' });
          newLines.push({ type: 'output', text: 'Mode                 LastWriteTime         Length Name' });
          newLines.push({ type: 'output', text: '----                 -------------         ------ ----' });
          for (const c of children) {
            const mode = c.type === 'folder' ? 'd-----' : '-a----';
            const size = c.type === 'folder' ? '' : String(c.size);
            newLines.push({ type: 'output', text: `${mode}          1/1/2026   12:00 AM    ${size.padStart(10)} ${c.name}` });
          }
        }
        break;
      }
      case 'cd': {
        if (!args[0] || args[0] === '~') {
          setCwd('/Users/you');
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `Set-Location : Cannot find path '${formatPath(resolvePath(args[0]))}'` });
          } else if (node.type !== 'folder') {
            newLines.push({ type: 'error', text: `Set-Location : '${args[0]}' is not a directory` });
          } else {
            setCwd(path);
          }
        }
        break;
      }
      case 'pwd':
        newLines.push({ type: 'output', text: '\nPath\n----\n' + formatPath(cwd) });
        break;
      case 'mkdir': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'mkdir : Missing argument' });
        } else {
          const parent = getNodeByPath(cwd);
          if (parent) {
            createFolderFn(parent.id, args[0]);
            newLines.push({ type: 'output', text: `    Directory: ${formatPath(cwd)}\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----          1/1/2026   12:00 AM                ${args[0]}` });
          }
        }
        break;
      }
      case 'touch': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'New-Item : Missing argument' });
        } else {
          const parent = getNodeByPath(cwd);
          if (parent) createFileFn(parent.id, args[0]);
        }
        break;
      }
      case 'rm': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'Remove-Item : Missing argument' });
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `Remove-Item : Cannot find path '${formatPath(path)}'` });
          } else {
            deleteNode(node.id);
          }
        }
        break;
      }
      case 'mv': {
        if (args.length < 2) {
          newLines.push({ type: 'error', text: 'Move-Item : Missing destination argument' });
        } else {
          const src = getNodeByPath(resolvePath(args[0]));
          const dest = getNodeByPath(resolvePath(args[1]));
          if (!src) {
            newLines.push({ type: 'error', text: `Move-Item : Cannot find path '${args[0]}'` });
          } else if (!dest || dest.type !== 'folder') {
            newLines.push({ type: 'error', text: `Move-Item : '${args[1]}' is not a directory` });
          } else {
            moveNode(src.id, dest.id);
          }
        }
        break;
      }
      case 'cp': {
        if (args.length < 2) {
          newLines.push({ type: 'error', text: 'Copy-Item : Missing destination argument' });
        } else {
          const src = getNodeByPath(resolvePath(args[0]));
          const dest = getNodeByPath(resolvePath(args[1]));
          if (!src) {
            newLines.push({ type: 'error', text: `Copy-Item : Cannot find path '${args[0]}'` });
          } else if (!dest || dest.type !== 'folder') {
            newLines.push({ type: 'error', text: `Copy-Item : '${args[1]}' is not a directory` });
          } else {
            copyNode(src.id, dest.id);
          }
        }
        break;
      }
      case 'cat': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'Get-Content : Missing argument' });
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `Get-Content : Cannot find path '${formatPath(path)}'` });
          } else if (node.type !== 'file') {
            newLines.push({ type: 'error', text: `Get-Content : '${args[0]}' is a directory` });
          } else {
            newLines.push({ type: 'output', text: node.content || '' });
          }
        }
        break;
      }
      case 'echo':
        newLines.push({ type: 'output', text: args.join(' ') });
        break;
      case 'clear':
        setLines([]);
        setInput('');
        setCmdHistory([...cmdHistory, trimmed]);
        setHistoryIdx(-1);
        return;
      case 'help':
        newLines.push({
          type: 'output',
          text: 'Available commands: ls (dir), cd, pwd, mkdir, touch, rm (del), mv (move), cp (copy), cat (type), echo, cls (clear), help',
        });
        break;
      default:
        newLines.push({ type: 'error', text: `${command} : The term '${command}' is not recognized as the name of a cmdlet, function, script file, or operable program.` });
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
        background: '#012456',
        fontFamily: '"Cascadia Code", "Consolas", "Courier New", monospace',
        fontSize: '13px',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-auto p-3">
        {lines.map((line, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap"
            style={{
              color: line.type === 'error' ? '#f87171' : line.type === 'input' ? '#ffdd57' : '#cccccc',
            }}
          >
            {line.text}
          </div>
        ))}

        <div className="flex items-center">
          <span style={{ color: '#ffdd57' }}>{prompt}</span>
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
