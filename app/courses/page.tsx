import React from 'react';
import { getServerSupabase } from '@/lib/supabase-server';
import CoursesList from '@/components/courses/CoursesList';
import type { Course } from '@/components/courses/CourseCard';

export default async function CoursesPage() {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('golf_courses')
    .select('id, name, slug, location, description, image_url')
    .order('created_at', { ascending: false });

  const courses: Course[] = (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    location: c.location,
    description: c.description,
    image_url: c.image_url,
  }));

  // fallback UI if error
  if (error) {
    console.error('Supabase error fetching courses', error);
    return (
      <div className="min-h-screen p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">Error loading courses. Try again later.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold">Explore Golf Courses</h1>
          <p className="text-slate-600 mt-2">Discover top golf courses, book tee times and earn rewards.</p>
        </header>

        <main>
          <CoursesList initialCourses={courses} />
        </main>
      </div>
    </div>
  );
}
