"use client";
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import CourseCard, { Course } from './CourseCard';

export default function CoursesList({ initialCourses }: { initialCourses: Course[] }) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialCourses;
    return initialCourses.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) || (c.location ?? '').toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
      );
    });
  }, [initialCourses, query]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    startTransition(() => setQuery(v));
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <input
          value={query}
          onChange={onChange}
          placeholder="Search courses by name, location or feature"
          className="flex-1 rounded-md border border-gray-200 p-3 focus:ring-2 focus:ring-sky-500"
        />
        <div className="text-sm text-slate-500">{filtered.length} results</div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
