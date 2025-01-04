import Link from 'next/link';

const blogPosts = [
  {
    slug: "how-do-college-coaches-recruit-athletes",
    title: "How Do College Coaches Recruit Athletes? A Guide to Standing Out",
    author: "Inkbound Team",
    created_at: "2024-03-20T10:00:00Z",
    preview: "College coaches recruit athletes using a structured process that evaluates talent, academic performance, and character. Their goal is to find players who excel on the field and can also contribute to the team's culture and success..."
  }
];

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog Posts</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((blog) => (
            <article 
              key={blog.slug} 
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <Link 
                href={`/resources/blogs/${blog.slug}`}
                className="block group p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                  {blog.title}
                </h2>
                <div className="text-sm text-gray-500 mb-4">
                  By {blog.author} • {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {blog.preview}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}