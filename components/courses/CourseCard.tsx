"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export type Course = {
  id: string;
  name: string;
  slug: string;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
      <div className="relative h-44 rounded-md overflow-hidden bg-slate-100">
        {course.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.image_url} alt={course.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
        )}
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-lg font-semibold">{course.name}</h3>
        <p className="text-sm text-slate-500 mt-1 truncate">{course.location ?? 'Location not specified'}</p>
        <p className="text-sm text-slate-600 mt-3 line-clamp-2">{course.description ?? ''}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link href={`/courses/${course.slug}`} className="flex-1">
          <Button variant="outline" className="w-full">View details</Button>
        </Link>
        <Link href={`/courses/${course.slug}#book`} className="w-36">
          <Button className="w-full">Book now</Button>
        </Link>
      </div>
    </div>
  );
}
