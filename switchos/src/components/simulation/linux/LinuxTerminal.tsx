'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

export default function LinuxTerminal({ windowId }: { windowId: string }) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: 'Welcome to SwitchOS Terminal (bash)' },
    { type: 'output', text: 'Type "help" for a list of commands. Have fun! 🐧\n' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/home/you');
  const [history, setHistory] = useState<string[]>([]);
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
    if (path.startsWith('/')) return path;
    if (path.startsWith('~')) return '/home/you' + path.slice(1);
    const parts = cwd.split('/').filter(Boolean);
    for (const part of path.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    return '/' + parts.join('/');
  };

  const getPromptPath = () => {
    return cwd.replace('/home/you', '~');
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLines: TerminalLine[] = [
      ...lines,
      { type: 'input', text: `you@switchos:${getPromptPath()}$ ${trimmed}` },
    ];

    const [command, ...args] = trimmed.split(/\s+/);

    recordAction({
      type: 'type',
      target: { elementType: 'terminal' },
      data: { text: trimmed },
    });

    switch (command) {
      case 'ls': {
        const path = resolvePath(args[0] || '.');
        const node = getNodeByPath(path);
        if (!node) {
          newLines.push({ type: 'error', text: `ls: cannot access '${args[0] || path}': No such file or directory` });
        } else if (node.type !== 'folder') {
          newLines.push({ type: 'output', text: node.name });
        } else {
          const children = getChildren(node.id);
          const names = children
            .filter((c) => !c.metadata?.isHidden || args.includes('-a'))
            .map((c) => c.type === 'folder' ? c.name + '/' : c.name);
          newLines.push({ type: 'output', text: names.join('  ') || '' });
        }
        break;
      }
      case 'cd': {
        if (!args[0] || args[0] === '~') {
          setCwd('/home/you');
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `bash: cd: ${args[0]}: No such file or directory` });
          } else if (node.type !== 'folder') {
            newLines.push({ type: 'error', text: `bash: cd: ${args[0]}: Not a directory` });
          } else {
            setCwd(path);
          }
        }
        break;
      }
      case 'pwd':
        newLines.push({ type: 'output', text: cwd });
        break;
      case 'mkdir': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'mkdir: missing operand' });
        } else {
          const parentPath = args[0].includes('/') ? resolvePath(args[0].substring(0, args[0].lastIndexOf('/'))) : cwd;
          const folderName = args[0].includes('/') ? args[0].substring(args[0].lastIndexOf('/') + 1) : args[0];
          const parent = getNodeByPath(parentPath);
          if (!parent) {
            newLines.push({ type: 'error', text: `mkdir: cannot create directory '${args[0]}': No such file or directory` });
          } else {
            createFolderFn(parent.id, folderName);
          }
        }
        break;
      }
      case 'touch': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'touch: missing file operand' });
        } else {
          const parent = getNodeByPath(cwd);
          if (parent) createFileFn(parent.id, args[0]);
        }
        break;
      }
      case 'rm': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'rm: missing operand' });
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `rm: cannot remove '${args[0]}': No such file or directory` });
          } else {
            deleteNode(node.id);
          }
        }
        break;
      }
      case 'mv': {
        if (args.length < 2) {
          newLines.push({ type: 'error', text: 'mv: missing destination operand' });
        } else {
          const srcPath = resolvePath(args[0]);
          const destPath = resolvePath(args[1]);
          const src = getNodeByPath(srcPath);
          const dest = getNodeByPath(destPath);
          if (!src) {
            newLines.push({ type: 'error', text: `mv: cannot stat '${args[0]}': No such file or directory` });
          } else if (!dest || dest.type !== 'folder') {
            newLines.push({ type: 'error', text: `mv: target '${args[1]}': Not a directory` });
          } else {
            moveNode(src.id, dest.id);
          }
        }
        break;
      }
      case 'cp': {
        if (args.length < 2) {
          newLines.push({ type: 'error', text: 'cp: missing destination operand' });
        } else {
          const srcPath = resolvePath(args[0]);
          const destPath = resolvePath(args[1]);
          const src = getNodeByPath(srcPath);
          const dest = getNodeByPath(destPath);
          if (!src) {
            newLines.push({ type: 'error', text: `cp: cannot stat '${args[0]}': No such file or directory` });
          } else if (!dest || dest.type !== 'folder') {
            newLines.push({ type: 'error', text: `cp: target '${args[1]}': Not a directory` });
          } else {
            copyNode(src.id, dest.id);
          }
        }
        break;
      }
      case 'cat': {
        if (!args[0]) {
          newLines.push({ type: 'error', text: 'cat: missing operand' });
        } else {
          const path = resolvePath(args[0]);
          const node = getNodeByPath(path);
          if (!node) {
            newLines.push({ type: 'error', text: `cat: ${args[0]}: No such file or directory` });
          } else if (node.type !== 'file') {
            newLines.push({ type: 'error', text: `cat: ${args[0]}: Is a directory` });
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
        setHistory([...history, trimmed]);
        setHistoryIdx(-1);
        return;
      case 'whoami':
        newLines.push({ type: 'output', text: 'you' });
        break;
      case 'uname':
        newLines.push({ type: 'output', text: args.includes('-a') ? 'Linux switchos-penguin 6.1.0-switchos #1 SMP x86_64 GNU/Linux' : 'Linux' });
        break;
      case 'help':
        newLines.push({
          type: 'output',
          text: 'Available commands: ls, cd, pwd, mkdir, touch, rm, mv, cp, cat, echo, whoami, uname, clear, help',
        });
        break;
      default:
        newLines.push({ type: 'error', text: `bash: ${command}: command not found` });
    }

    setLines(newLines);
    setInput('');
    setHistory([...history, trimmed]);
    setHistoryIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      if (history[newIdx]) {
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= history.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (input.trim()) {
        const parts = input.trim().split(/\s+/);
        const partial = parts[parts.length - 1];
        const dirPath = partial.includes('/') ? resolvePath(partial.substring(0, partial.lastIndexOf('/'))) : cwd;
        const prefix = partial.includes('/') ? partial.substring(partial.lastIndexOf('/') + 1) : partial;
        const dir = getNodeByPath(dirPath);
        if (dir) {
          const children = getChildren(dir.id);
          const matches = children.filter((c) => c.name.toLowerCase().startsWith(prefix.toLowerCase()));
          if (matches.length === 1) {
            parts[parts.length - 1] = partial.includes('/')
              ? partial.substring(0, partial.lastIndexOf('/') + 1) + matches[0].name
              : matches[0].name;
            setInput(parts.join(' '));
          }
        }
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full cursor-text"
      style={{
        background: '#300a24',
        fontFamily: '"Ubuntu Mono", "DejaVu Sans Mono", "Courier New", monospace',
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
              color: line.type === 'error' ? '#f87171' : line.type === 'input' ? '#4e9a06' : '#d4d4d4',
            }}
          >
            {line.text}
          </div>
        ))}

        {/* Current prompt */}
        <div className="flex items-center">
          <span style={{ color: '#4e9a06' }}>
            you@switchos<span style={{ color: '#d4d4d4' }}>:</span><span style={{ color: '#729fcf' }}>{getPromptPath()}</span><span style={{ color: '#d4d4d4' }}>$ </span>
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none"
            style={{ color: '#d4d4d4', caretColor: '#d4d4d4' }}
            spellCheck={false}
            autoFocus
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
