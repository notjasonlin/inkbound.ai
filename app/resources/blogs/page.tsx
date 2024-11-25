import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { encryptId } from '@/app/utils/encryption';

export default async function BlogsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: blogs } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_admins (
        name
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog Posts</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs?.map((blog) => (
            <article 
              key={blog.id} 
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <Link 
                href={`/resources/blogs/${encodeURIComponent(blog.title.toLowerCase().replace(/\s+/g, '-'))}`}
                className="block group p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                  {blog.title}
                </h2>
                <div className="text-sm text-gray-500 mb-4">
                  By {blog.blog_admins.name} • {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {blog.content.substring(0, 200)}...
                </p>
              </Link>
            </article>
          ))}

          {blogs?.length === 0 && (
            <p className="text-gray-600 text-center py-8 col-span-3">
              No blog posts available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}