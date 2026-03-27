import { v4 as uuidv4 } from 'uuid';

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'app';
  parentId: string | null;
  children: string[];
  content: string;
  icon: string;
  size: number;
  createdAt: number;
  modifiedAt: number;
  metadata: {
    fileExtension?: string;
    mimeType?: string;
    isHidden?: boolean;
    isSystem?: boolean;
  };
}

export interface FileSystemState {
  nodes: Record<string, FileSystemNode>;
  rootId: string;
  trashId: string;
}

function createNode(
  overrides: Partial<FileSystemNode> & Pick<FileSystemNode, 'name' | 'type'>
): FileSystemNode {
  const now = Date.now();
  return {
    id: uuidv4(),
    parentId: null,
    children: [],
    content: '',
    icon: overrides.type === 'folder' ? 'folder' : overrides.type === 'app' ? 'app' : 'file',
    size: 0,
    createdAt: now,
    modifiedAt: now,
    metadata: {},
    ...overrides,
  };
}

export function createDefaultMacFileSystem(): FileSystemState {
  const root = createNode({ name: '/', type: 'folder' });
  const users = createNode({ name: 'Users', type: 'folder', parentId: root.id });
  const you = createNode({ name: 'you', type: 'folder', parentId: users.id });
  const desktop = createNode({ name: 'Desktop', type: 'folder', parentId: you.id });
  const documents = createNode({ name: 'Documents', type: 'folder', parentId: you.id });
  const downloads = createNode({ name: 'Downloads', type: 'folder', parentId: you.id });
  const pictures = createNode({ name: 'Pictures', type: 'folder', parentId: you.id });
  const music = createNode({ name: 'Music', type: 'folder', parentId: you.id });
  const movies = createNode({ name: 'Movies', type: 'folder', parentId: you.id });

  const welcomeTxt = createNode({
    name: 'Welcome.txt',
    type: 'file',
    parentId: desktop.id,
    content: 'Welcome to SwitchOS! This is your simulated Mac desktop.\n\nFeel free to explore — you can\'t break anything here.',
    icon: 'text',
    size: 112,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const sampleImg = createNode({
    name: 'SampleImage.png',
    type: 'file',
    parentId: desktop.id,
    icon: 'image',
    size: 245000,
    metadata: { fileExtension: 'png', mimeType: 'image/png' },
  });
  const notesTxt = createNode({
    name: 'Notes.txt',
    type: 'file',
    parentId: documents.id,
    content: 'My notes go here.',
    icon: 'text',
    size: 18,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const reportDocx = createNode({
    name: 'Report.docx',
    type: 'file',
    parentId: documents.id,
    icon: 'document',
    size: 52000,
    metadata: { fileExtension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  });
  const installerDmg = createNode({
    name: 'installer.dmg',
    type: 'file',
    parentId: downloads.id,
    icon: 'disk-image',
    size: 150000000,
    metadata: { fileExtension: 'dmg', mimeType: 'application/x-apple-diskimage' },
  });
  const vacationJpg = createNode({
    name: 'vacation.jpg',
    type: 'file',
    parentId: pictures.id,
    icon: 'image',
    size: 3200000,
    metadata: { fileExtension: 'jpg', mimeType: 'image/jpeg' },
  });

  const applications = createNode({ name: 'Applications', type: 'folder', parentId: root.id });
  const finderApp = createNode({ name: 'Finder.app', type: 'app', parentId: applications.id, icon: 'finder' });
  const textEditApp = createNode({ name: 'TextEdit.app', type: 'app', parentId: applications.id, icon: 'textedit' });
  const terminalApp = createNode({ name: 'Terminal.app', type: 'app', parentId: applications.id, icon: 'terminal' });
  const settingsApp = createNode({ name: 'System Settings.app', type: 'app', parentId: applications.id, icon: 'settings' });
  const safariApp = createNode({ name: 'Safari.app', type: 'app', parentId: applications.id, icon: 'safari' });
  const calculatorApp = createNode({ name: 'Calculator.app', type: 'app', parentId: applications.id, icon: 'calculator' });

  const trash = createNode({ name: 'Trash', type: 'folder', parentId: root.id });

  // Wire up children
  root.children = [users.id, applications.id, trash.id];
  users.children = [you.id];
  you.children = [desktop.id, documents.id, downloads.id, pictures.id, music.id, movies.id];
  desktop.children = [welcomeTxt.id, sampleImg.id];
  documents.children = [notesTxt.id, reportDocx.id];
  downloads.children = [installerDmg.id];
  pictures.children = [vacationJpg.id];
  applications.children = [finderApp.id, textEditApp.id, terminalApp.id, settingsApp.id, safariApp.id, calculatorApp.id];

  const allNodes = [
    root, users, you, desktop, documents, downloads, pictures, music, movies,
    welcomeTxt, sampleImg, notesTxt, reportDocx, installerDmg, vacationJpg,
    applications, finderApp, textEditApp, terminalApp, settingsApp, safariApp, calculatorApp,
    trash,
  ];

  const nodes: Record<string, FileSystemNode> = {};
  for (const node of allNodes) {
    nodes[node.id] = node;
  }

  return { nodes, rootId: root.id, trashId: trash.id };
}

// File system operations (pure functions that return new state)

export function getNodeByPath(state: FileSystemState, path: string): FileSystemNode | null {
  if (path === '/') return state.nodes[state.rootId];
  const parts = path.split('/').filter(Boolean);
  let current = state.nodes[state.rootId];
  for (const part of parts) {
    const child = current.children
      .map((id) => state.nodes[id])
      .find((n) => n && n.name === part);
    if (!child) return null;
    current = child;
  }
  return current;
}

export function getNodePath(state: FileSystemState, nodeId: string): string {
  const parts: string[] = [];
  let current = state.nodes[nodeId];
  while (current && current.id !== state.rootId) {
    parts.unshift(current.name);
    if (current.parentId) {
      current = state.nodes[current.parentId];
    } else {
      break;
    }
  }
  return '/' + parts.join('/');
}

export function getChildren(state: FileSystemState, nodeId: string): FileSystemNode[] {
  const node = state.nodes[nodeId];
  if (!node) return [];
  return node.children.map((id) => state.nodes[id]).filter(Boolean);
}

export function createFile(
  state: FileSystemState,
  parentId: string,
  name: string,
  content = ''
): { state: FileSystemState; node: FileSystemNode } {
  const ext = name.includes('.') ? name.split('.').pop() : undefined;
  const node = createNode({
    name,
    type: 'file',
    parentId,
    content,
    size: content.length,
    metadata: { fileExtension: ext },
  });

  const parent = { ...state.nodes[parentId], children: [...state.nodes[parentId].children, node.id] };
  return {
    state: {
      ...state,
      nodes: { ...state.nodes, [node.id]: node, [parentId]: parent },
    },
    node,
  };
}

export function createFolder(
  state: FileSystemState,
  parentId: string,
  name: string
): { state: FileSystemState; node: FileSystemNode } {
  const node = createNode({ name, type: 'folder', parentId });
  const parent = { ...state.nodes[parentId], children: [...state.nodes[parentId].children, node.id] };
  return {
    state: {
      ...state,
      nodes: { ...state.nodes, [node.id]: node, [parentId]: parent },
    },
    node,
  };
}

export function renameNode(
  state: FileSystemState,
  nodeId: string,
  newName: string
): FileSystemState {
  const node = state.nodes[nodeId];
  if (!node) return state;
  return {
    ...state,
    nodes: {
      ...state.nodes,
      [nodeId]: { ...node, name: newName, modifiedAt: Date.now() },
    },
  };
}

export function moveNode(
  state: FileSystemState,
  nodeId: string,
  newParentId: string
): FileSystemState {
  const node = state.nodes[nodeId];
  if (!node || !node.parentId) return state;
  const oldParent = state.nodes[node.parentId];
  const newParent = state.nodes[newParentId];
  if (!oldParent || !newParent) return state;

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [nodeId]: { ...node, parentId: newParentId, modifiedAt: Date.now() },
      [oldParent.id]: { ...oldParent, children: oldParent.children.filter((id) => id !== nodeId) },
      [newParent.id]: { ...newParent, children: [...newParent.children, nodeId] },
    },
  };
}

function deepCopyNode(
  state: FileSystemState,
  nodeId: string,
  newParentId: string
): { nodes: Record<string, FileSystemNode>; newNodeId: string } {
  const original = state.nodes[nodeId];
  const copy = createNode({
    ...original,
    id: uuidv4(),
    parentId: newParentId,
    children: [],
  });

  let allNewNodes: Record<string, FileSystemNode> = { [copy.id]: copy };

  if (original.type === 'folder') {
    for (const childId of original.children) {
      const result = deepCopyNode(state, childId, copy.id);
      copy.children.push(result.newNodeId);
      allNewNodes = { ...allNewNodes, ...result.nodes };
    }
    allNewNodes[copy.id] = copy;
  }

  return { nodes: allNewNodes, newNodeId: copy.id };
}

export function copyNode(
  state: FileSystemState,
  nodeId: string,
  newParentId: string
): { state: FileSystemState; newNodeId: string } {
  const { nodes: newNodes, newNodeId } = deepCopyNode(state, nodeId, newParentId);
  const parent = state.nodes[newParentId];

  return {
    state: {
      ...state,
      nodes: {
        ...state.nodes,
        ...newNodes,
        [newParentId]: { ...parent, children: [...parent.children, newNodeId] },
      },
    },
    newNodeId,
  };
}

export function deleteNode(
  state: FileSystemState,
  nodeId: string
): FileSystemState {
  // Move to trash
  return moveNode(state, nodeId, state.trashId);
}

export function permanentDeleteNode(
  state: FileSystemState,
  nodeId: string
): FileSystemState {
  const node = state.nodes[nodeId];
  if (!node) return state;

  // Collect all descendant IDs
  const toDelete = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    toDelete.add(id);
    const n = state.nodes[id];
    if (n?.children) queue.push(...n.children);
  }

  const newNodes = { ...state.nodes };
  for (const id of toDelete) {
    delete newNodes[id];
  }

  // Remove from parent
  if (node.parentId && newNodes[node.parentId]) {
    newNodes[node.parentId] = {
      ...newNodes[node.parentId],
      children: newNodes[node.parentId].children.filter((id) => id !== nodeId),
    };
  }

  return { ...state, nodes: newNodes };
}

export function findByName(state: FileSystemState, name: string): FileSystemNode[] {
  return Object.values(state.nodes).filter(
    (n) => n.name.toLowerCase().includes(name.toLowerCase())
  );
}

export function createDefaultLinuxFileSystem(): FileSystemState {
  const root = createNode({ name: '/', type: 'folder' });
  const home = createNode({ name: 'home', type: 'folder', parentId: root.id });
  const you = createNode({ name: 'you', type: 'folder', parentId: home.id });
  const desktop = createNode({ name: 'Desktop', type: 'folder', parentId: you.id });
  const documents = createNode({ name: 'Documents', type: 'folder', parentId: you.id });
  const downloads = createNode({ name: 'Downloads', type: 'folder', parentId: you.id });
  const pictures = createNode({ name: 'Pictures', type: 'folder', parentId: you.id });
  const music = createNode({ name: 'Music', type: 'folder', parentId: you.id });
  const videos = createNode({ name: 'Videos', type: 'folder', parentId: you.id });

  const etc = createNode({ name: 'etc', type: 'folder', parentId: root.id });
  const usr = createNode({ name: 'usr', type: 'folder', parentId: root.id });
  const usrShare = createNode({ name: 'share', type: 'folder', parentId: usr.id });
  const applications = createNode({ name: 'applications', type: 'folder', parentId: usrShare.id });
  const varDir = createNode({ name: 'var', type: 'folder', parentId: root.id });
  const tmp = createNode({ name: 'tmp', type: 'folder', parentId: root.id });
  const opt = createNode({ name: 'opt', type: 'folder', parentId: root.id });

  const welcomeTxt = createNode({
    name: 'Welcome.txt',
    type: 'file',
    parentId: desktop.id,
    content: 'Welcome to Linux! You\'re officially a penguin person now. 🐧\n\nDon\'t worry — nothing here can break. Explore freely!',
    icon: 'text',
    size: 105,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const todoTxt = createNode({
    name: 'todo.txt',
    type: 'file',
    parentId: desktop.id,
    content: '[ ] Learn to navigate the desktop\n[ ] Open the file manager\n[ ] Try the terminal\n[ ] Become a Linux wizard 🧙',
    icon: 'text',
    size: 102,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const penguinFacts = createNode({
    name: 'penguin-facts.txt',
    type: 'file',
    parentId: documents.id,
    content: 'Fun Penguin & Linux Facts!\n\n🐧 Tux the penguin has been the Linux mascot since 1996.\n🐧 Linus Torvalds chose a penguin because he was bitten by one at a zoo.\n🐧 Linux runs on everything from phones to supercomputers.\n🐧 Over 96% of the world\'s top 1 million servers run Linux.\n🐧 The first Linux kernel was just 10,000 lines of code!',
    icon: 'text',
    size: 320,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const secretRecipe = createNode({
    name: 'secret-recipe.txt',
    type: 'file',
    parentId: documents.id,
    content: 'The Secret Recipe for Mastering Linux:\n\n1. Don\'t be afraid of the terminal — it\'s your best friend\n2. Tab completion saves lives (and typing)\n3. When in doubt, type \'help\'\n4. Read error messages — they\'re trying to help!\n5. Have fun and experiment freely 🎉',
    icon: 'text',
    size: 250,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const notesTxt = createNode({
    name: 'Notes.txt',
    type: 'file',
    parentId: documents.id,
    content: 'My Linux notes go here.',
    icon: 'text',
    size: 23,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const vacationJpg = createNode({
    name: 'vacation.jpg',
    type: 'file',
    parentId: pictures.id,
    icon: 'image',
    size: 3200000,
    metadata: { fileExtension: 'jpg', mimeType: 'image/jpeg' },
  });
  const setupAppImage = createNode({
    name: 'cool-app.AppImage',
    type: 'file',
    parentId: downloads.id,
    icon: 'file',
    size: 45000000,
    metadata: { fileExtension: 'AppImage' },
  });

  const hostname = createNode({
    name: 'hostname',
    type: 'file',
    parentId: etc.id,
    content: 'switchos-penguin',
    icon: 'text',
    size: 17,
    metadata: { isSystem: true },
  });
  const osRelease = createNode({
    name: 'os-release',
    type: 'file',
    parentId: etc.id,
    content: 'NAME="SwitchOS Linux"\nVERSION="1.0 (Fun Edition)"\nID=switchos\nPRETTY_NAME="SwitchOS Linux 1.0 (Fun Edition)"',
    icon: 'text',
    size: 100,
    metadata: { isSystem: true },
  });

  const fileManagerApp = createNode({ name: 'Files.app', type: 'app', parentId: applications.id, icon: 'filemanager' });
  const textEditorApp = createNode({ name: 'Text Editor.app', type: 'app', parentId: applications.id, icon: 'texteditor' });
  const terminalApp = createNode({ name: 'Terminal.app', type: 'app', parentId: applications.id, icon: 'linuxterminal' });
  const settingsApp = createNode({ name: 'Settings.app', type: 'app', parentId: applications.id, icon: 'linuxsettings' });

  const trash = createNode({ name: 'Trash', type: 'folder', parentId: root.id });

  // Wire up children
  root.children = [home.id, etc.id, usr.id, varDir.id, tmp.id, opt.id, trash.id];
  home.children = [you.id];
  you.children = [desktop.id, documents.id, downloads.id, pictures.id, music.id, videos.id];
  desktop.children = [welcomeTxt.id, todoTxt.id];
  documents.children = [penguinFacts.id, secretRecipe.id, notesTxt.id];
  downloads.children = [setupAppImage.id];
  pictures.children = [vacationJpg.id];
  etc.children = [hostname.id, osRelease.id];
  usr.children = [usrShare.id];
  usrShare.children = [applications.id];
  applications.children = [fileManagerApp.id, textEditorApp.id, terminalApp.id, settingsApp.id];

  const allNodes = [
    root, home, you, desktop, documents, downloads, pictures, music, videos,
    etc, usr, usrShare, applications, varDir, tmp, opt,
    welcomeTxt, todoTxt, penguinFacts, secretRecipe, notesTxt, vacationJpg, setupAppImage,
    hostname, osRelease,
    fileManagerApp, textEditorApp, terminalApp, settingsApp,
    trash,
  ];

  const nodes: Record<string, FileSystemNode> = {};
  for (const node of allNodes) {
    nodes[node.id] = node;
  }

  return { nodes, rootId: root.id, trashId: trash.id };
}

export function createDefaultWindowsFileSystem(): FileSystemState {
  const root = createNode({ name: '/', type: 'folder' });
  const users = createNode({ name: 'Users', type: 'folder', parentId: root.id });
  const you = createNode({ name: 'you', type: 'folder', parentId: users.id });
  const desktop = createNode({ name: 'Desktop', type: 'folder', parentId: you.id });
  const documents = createNode({ name: 'Documents', type: 'folder', parentId: you.id });
  const downloads = createNode({ name: 'Downloads', type: 'folder', parentId: you.id });
  const pictures = createNode({ name: 'Pictures', type: 'folder', parentId: you.id });
  const music = createNode({ name: 'Music', type: 'folder', parentId: you.id });
  const videos = createNode({ name: 'Videos', type: 'folder', parentId: you.id });

  const welcomeTxt = createNode({
    name: 'Welcome.txt',
    type: 'file',
    parentId: desktop.id,
    content: 'Welcome to SwitchOS! This is your simulated Windows desktop.\n\nFeel free to explore — you can\'t break anything here.',
    icon: 'text',
    size: 118,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const sampleImg = createNode({
    name: 'SampleImage.png',
    type: 'file',
    parentId: desktop.id,
    icon: 'image',
    size: 245000,
    metadata: { fileExtension: 'png', mimeType: 'image/png' },
  });
  const notesTxt = createNode({
    name: 'Notes.txt',
    type: 'file',
    parentId: documents.id,
    content: 'My notes go here.',
    icon: 'text',
    size: 18,
    metadata: { fileExtension: 'txt', mimeType: 'text/plain' },
  });
  const reportDocx = createNode({
    name: 'Report.docx',
    type: 'file',
    parentId: documents.id,
    icon: 'document',
    size: 52000,
    metadata: { fileExtension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  });
  const installerExe = createNode({
    name: 'setup.exe',
    type: 'file',
    parentId: downloads.id,
    icon: 'executable',
    size: 85000000,
    metadata: { fileExtension: 'exe', mimeType: 'application/x-msdownload' },
  });
  const vacationJpg = createNode({
    name: 'vacation.jpg',
    type: 'file',
    parentId: pictures.id,
    icon: 'image',
    size: 3200000,
    metadata: { fileExtension: 'jpg', mimeType: 'image/jpeg' },
  });

  const programFiles = createNode({ name: 'Program Files', type: 'folder', parentId: root.id });
  const fileExplorerApp = createNode({ name: 'File Explorer', type: 'app', parentId: programFiles.id, icon: 'fileexplorer' });
  const notepadApp = createNode({ name: 'Notepad', type: 'app', parentId: programFiles.id, icon: 'notepad' });
  const powershellApp = createNode({ name: 'PowerShell', type: 'app', parentId: programFiles.id, icon: 'powershell' });
  const cmdApp = createNode({ name: 'Command Prompt', type: 'app', parentId: programFiles.id, icon: 'cmd' });
  const settingsApp = createNode({ name: 'Settings', type: 'app', parentId: programFiles.id, icon: 'winsettings' });
  const edgeApp = createNode({ name: 'Microsoft Edge', type: 'app', parentId: programFiles.id, icon: 'edge' });
  const calculatorApp = createNode({ name: 'Calculator', type: 'app', parentId: programFiles.id, icon: 'calculator' });

  const recycleBin = createNode({ name: 'Recycle Bin', type: 'folder', parentId: root.id });

  // Wire up children
  root.children = [users.id, programFiles.id, recycleBin.id];
  users.children = [you.id];
  you.children = [desktop.id, documents.id, downloads.id, pictures.id, music.id, videos.id];
  desktop.children = [welcomeTxt.id, sampleImg.id];
  documents.children = [notesTxt.id, reportDocx.id];
  downloads.children = [installerExe.id];
  pictures.children = [vacationJpg.id];
  programFiles.children = [fileExplorerApp.id, notepadApp.id, powershellApp.id, cmdApp.id, settingsApp.id, edgeApp.id, calculatorApp.id];

  const allNodes = [
    root, users, you, desktop, documents, downloads, pictures, music, videos,
    welcomeTxt, sampleImg, notesTxt, reportDocx, installerExe, vacationJpg,
    programFiles, fileExplorerApp, notepadApp, powershellApp, cmdApp, settingsApp, edgeApp, calculatorApp,
    recycleBin,
  ];

  const nodes: Record<string, FileSystemNode> = {};
  for (const node of allNodes) {
    nodes[node.id] = node;
  }

  return { nodes, rootId: root.id, trashId: recycleBin.id };
}
