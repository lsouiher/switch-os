import type { Lesson, Track } from './types';

// macOS Foundations lessons
import macLesson01 from './content/macos-foundations/01-desktop-basics.json';
import macLesson02 from './content/macos-foundations/02-dock-and-apps.json';
import macLesson03 from './content/macos-foundations/03-finder-navigation.json';
import macLesson04 from './content/macos-foundations/04-creating-files-folders.json';
import macLesson05 from './content/macos-foundations/05-moving-and-copying.json';
import macLesson06 from './content/macos-foundations/06-spotlight-search.json';
import macLesson07 from './content/macos-foundations/07-system-settings.json';
import macLesson08 from './content/macos-foundations/08-keyboard-shortcuts.json';
import macLesson09 from './content/macos-foundations/09-multiple-windows.json';
import macLesson10 from './content/macos-foundations/10-trash-and-cleanup.json';

// Windows Foundations lessons
import winLesson01 from './content/windows-foundations/01-desktop-basics.json';
import winLesson02 from './content/windows-foundations/02-start-menu-and-apps.json';
import winLesson03 from './content/windows-foundations/03-file-explorer-navigation.json';
import winLesson04 from './content/windows-foundations/04-creating-files-folders.json';
import winLesson05 from './content/windows-foundations/05-moving-and-copying.json';
import winLesson06 from './content/windows-foundations/06-search.json';
import winLesson07 from './content/windows-foundations/07-windows-settings.json';
import winLesson08 from './content/windows-foundations/08-keyboard-shortcuts.json';
import winLesson09 from './content/windows-foundations/09-window-management.json';
import winLesson10 from './content/windows-foundations/10-recycle-bin-and-cleanup.json';

// Linux Foundations lessons
import linLesson01 from './content/linux-foundations/01-welcome-to-linux.json';
import linLesson02 from './content/linux-foundations/02-dock-and-launching.json';
import linLesson03 from './content/linux-foundations/03-files-and-folders.json';
import linLesson04 from './content/linux-foundations/04-creating-files-folders.json';
import linLesson05 from './content/linux-foundations/05-moving-copying.json';
import linLesson06 from './content/linux-foundations/06-meet-the-terminal.json';
import linLesson07 from './content/linux-foundations/07-terminal-power-ups.json';
import linLesson08 from './content/linux-foundations/08-settings-customization.json';
import linLesson09 from './content/linux-foundations/09-keyboard-shortcuts.json';
import linLesson10 from './content/linux-foundations/10-cleanup-and-review.json';

const ALL_LESSONS: Lesson[] = [
  // macOS
  macLesson01, macLesson02, macLesson03, macLesson04, macLesson05,
  macLesson06, macLesson07, macLesson08, macLesson09, macLesson10,
  // Windows
  winLesson01, winLesson02, winLesson03, winLesson04, winLesson05,
  winLesson06, winLesson07, winLesson08, winLesson09, winLesson10,
  // Linux
  linLesson01, linLesson02, linLesson03, linLesson04, linLesson05,
  linLesson06, linLesson07, linLesson08, linLesson09, linLesson10,
] as Lesson[];

export function getLesson(lessonId: string): Lesson | null {
  return ALL_LESSONS.find((l) => l.id === lessonId) || null;
}

export function getLessonByOrder(trackId: string, order: number): Lesson | null {
  return ALL_LESSONS.find((l) => l.trackId === trackId && l.order === order) || null;
}

export function getTrackLessons(trackId: string): Lesson[] {
  return ALL_LESSONS
    .filter((l) => l.trackId === trackId)
    .sort((a, b) => a.order - b.order);
}

export function getAllTracks(): Track[] {
  return [
    {
      id: 'macos-foundations',
      title: 'macOS Foundations',
      description: 'Learn the basics of navigating and using macOS',
      icon: '🍎',
      lessons: getTrackLessons('macos-foundations'),
      totalLessons: 10,
    },
    {
      id: 'windows-foundations',
      title: 'Windows Foundations',
      description: 'Learn the basics of navigating and using Windows',
      icon: '🪟',
      lessons: getTrackLessons('windows-foundations'),
      totalLessons: 10,
    },
    {
      id: 'linux-foundations',
      title: 'Linux Foundations',
      description: 'Learn the Linux desktop and terminal — the penguin way!',
      icon: '🐧',
      lessons: getTrackLessons('linux-foundations'),
      totalLessons: 10,
    },
  ];
}

export function getAllLessons(): Lesson[] {
  return ALL_LESSONS;
}
