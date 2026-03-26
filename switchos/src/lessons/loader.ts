import type { Lesson, Track } from './types';

// Import all lesson files statically
import lesson01 from './content/macos-foundations/01-desktop-basics.json';
import lesson02 from './content/macos-foundations/02-dock-and-apps.json';
import lesson03 from './content/macos-foundations/03-finder-navigation.json';
import lesson04 from './content/macos-foundations/04-creating-files-folders.json';
import lesson05 from './content/macos-foundations/05-moving-and-copying.json';
import lesson06 from './content/macos-foundations/06-spotlight-search.json';
import lesson07 from './content/macos-foundations/07-system-settings.json';
import lesson08 from './content/macos-foundations/08-keyboard-shortcuts.json';
import lesson09 from './content/macos-foundations/09-multiple-windows.json';
import lesson10 from './content/macos-foundations/10-trash-and-cleanup.json';

const ALL_LESSONS: Lesson[] = [
  lesson01, lesson02, lesson03, lesson04, lesson05,
  lesson06, lesson07, lesson08, lesson09, lesson10,
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
  ];
}

export function getAllLessons(): Lesson[] {
  return ALL_LESSONS;
}
