import React from 'react';
import { getServerSupabase } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Params = { params: { slug: string } };

export default async function CourseDetailPage({ params }: Params) {
  const { slug } = params;
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('golf_courses')
    .select('id, name, slug, description, location, image_url')
    .eq('slug', slug)
    .limit(1)
    .single();

  if (error || !data) {
    console.warn('Course not found', slug, error);
    return notFound();
  }

  const course = data as any;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded shadow overflow-hidden">
        <div className="relative h-64 md:h-96 bg-slate-100">
          {course.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.image_url} alt={course.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold">{course.name}</h1>
              <p className="text-sm text-slate-600 mt-2">{course.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/courses/${course.slug}#book`}>
                <Button>Book Now</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-lg font-medium">About this course</h2>
            <p className="mt-3 text-slate-700">{course.description ?? 'No description available.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
