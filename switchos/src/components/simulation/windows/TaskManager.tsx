'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

const APP_NAMES: Record<string, string> = {
  fileexplorer: 'File Explorer',
  notepad: 'Notepad',
  powershell: 'Windows PowerShell',
  cmd: 'Command Prompt',
  winsettings: 'Settings',
  edge: 'Microsoft Edge',
  calculator: 'Calculator',
  taskmanager: 'Task Manager',
};

type Tab = 'processes' | 'performance' | 'details';

export default function TaskManager() {
  const runningApps = useSimulationStore((s) => s.runningApps);
  const quitApp = useSimulationStore((s) => s.quitApp);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('processes');

  const apps = Array.from(runningApps);

  // Pre-compute stable fake metrics per app
  const [metrics] = useState(() => {
    const m: Record<string, { cpu: string; mem: string }> = {};
    for (const appId of ['fileexplorer', 'notepad', 'powershell', 'cmd', 'winsettings', 'edge', 'calculator', 'taskmanager']) {
      m[appId] = {
        cpu: (Math.random() * 3).toFixed(1),
        mem: (Math.random() * 100 + 10).toFixed(1),
      };
    }
    return m;
  });

  const handleEndTask = () => {
    if (selectedApp && selectedApp !== 'taskmanager') {
      recordAction({ type: 'click', target: { elementType: 'taskmanager-end-task', elementId: selectedApp } });
      quitApp(selectedApp);
      setSelectedApp(null);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: '"Segoe UI", sans-serif' }}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {(['processes', 'performance', 'details'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'processes' ? (
        <>
          {/* Process list */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left bg-gray-50">
                  <th className="py-2 px-3 font-medium">Name</th>
                  <th className="py-2 px-3 font-medium w-24">Status</th>
                  <th className="py-2 px-3 font-medium w-16">CPU</th>
                  <th className="py-2 px-3 font-medium w-20">Memory</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((appId) => (
                  <tr
                    key={appId}
                    onClick={() => setSelectedApp(appId)}
                    className={`cursor-default border-b border-gray-100 ${
                      selectedApp === appId ? 'bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-1.5 px-3">{APP_NAMES[appId] || appId}</td>
                    <td className="py-1.5 px-3 text-green-600">Running</td>
                    <td className="py-1.5 px-3 text-gray-500">{metrics[appId]?.cpu || '0.5'}%</td>
                    <td className="py-1.5 px-3 text-gray-500">{metrics[appId]?.mem || '25.0'} MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
            <span className="text-[10px] text-gray-500">{apps.length} process{apps.length !== 1 ? 'es' : ''}</span>
            <button
              onClick={handleEndTask}
              disabled={!selectedApp || selectedApp === 'taskmanager'}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              End task
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          {activeTab === 'performance' ? 'Performance monitoring coming soon' : 'Detailed process view coming soon'}
        </div>
      )}
    </div>
  );
}
