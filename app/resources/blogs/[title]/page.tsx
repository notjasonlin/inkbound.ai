import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface BlogPost {
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  blog_admins: {
    name: string;
  };
}

type Props = {
  params: { title: string }
}

export default async function BlogPost({ params }: Props) {
  const decodedTitle = decodeURIComponent(params.title).replace(/-/g, ' ');
  const supabase = createServerComponentClient({ cookies });
  
  const { data: blog } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_admins (
        name
      )
    `)
    .ilike('title', decodedTitle)
    .single();

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500">
            <span>By {blog.blog_admins.name}</span>
            <span className="mx-2">•</span>
            <span>Published {new Date(blog.created_at).toLocaleDateString()}</span>
            {blog.updated_at !== blog.created_at && (
              <>
                <span className="mx-2">•</span>
                <span>Updated {new Date(blog.updated_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          {blog.content.split('\n').map((paragraph: string, index: number) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

// Match the metadata props type
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedTitle = decodeURIComponent(params.title).replace(/-/g, ' ');
  return {
    title: decodedTitle,
  };
} 