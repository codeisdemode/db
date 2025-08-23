"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowRight,
  BookOpen,
  Search,
  Tag,
  ChevronRight,
  ExternalLink
} from "lucide-react"

const blogPosts = [
  {
    id: "introducing-columnist",
    title: "Introducing Columnist: The Client-Side Database with Semantic Search",
    excerpt: "Discover how Columnist revolutionizes client-side data management with its columnar storage and AI-powered search capabilities.",
    author: "Alex Chen",
    date: "2024-03-15",
    readTime: "8 min read",
    tags: ["announcement", "database", "ai"],
    image: "/api/placeholder/400/250",
    featured: true
  },
  {
    id: "semantic-search-deep-dive",
    title: "Semantic Search Deep Dive: How Columnist Understands Your Data",
    excerpt: "Learn about the TF-IDF and vector embedding techniques that power Columnist's intelligent search functionality.",
    author: "Maria Rodriguez",
    date: "2024-03-10",
    readTime: "12 min read",
    tags: ["technical", "search", "ai"],
    image: "/api/placeholder/400/250"
  },
  {
    id: "building-chat-app",
    title: "Building a Real-Time Chat App with Columnist and React",
    excerpt: "Step-by-step guide to creating a modern chat application with offline support and semantic message search.",
    author: "James Wilson",
    date: "2024-03-05",
    readTime: "10 min read",
    tags: ["tutorial", "react", "chat"],
    image: "/api/placeholder/400/250"
  },
  {
    id: "columnar-vs-relational",
    title: "Columnar vs Relational: Why We Chose Columnar Storage for Client-Side",
    excerpt: "Exploring the performance benefits of columnar storage for analytical workloads in browser environments.",
    author: "Sarah Johnson",
    date: "2024-02-28",
    readTime: "6 min read",
    tags: ["architecture", "performance", "database"],
    image: "/api/placeholder/400/250"
  },
  {
    id: "firebase-sync-guide",
    title: "Complete Guide to Firebase Synchronization with Columnist",
    excerpt: "Learn how to keep your local Columnist database in sync with Firebase Firestore in real-time.",
    author: "Mike Zhang",
    date: "2024-02-22",
    readTime: "9 min read",
    tags: ["tutorial", "firebase", "sync"],
    image: "/api/placeholder/400/250"
  },
  {
    id: "offline-first-apps",
    title: "Building Offline-First Applications with Columnist",
    excerpt: "Best practices for creating applications that work seamlessly offline with automatic conflict resolution.",
    author: "Emily Davis",
    date: "2024-02-15",
    readTime: "7 min read",
    tags: ["patterns", "offline", "pwa"],
    image: "/api/placeholder/400/250"
  }
]

const categories = [
  { name: "All", count: 12 },
  { name: "Tutorials", count: 5 },
  { name: "Technical", count: 4 },
  { name: "Announcements", count: 3 }
]

const popularTags = [
  "database", "react", "ai", "search", "firebase", "sync", "offline", "performance"
]

const authors = [
  { name: "Alex Chen", role: "Founder & CEO", posts: 8 },
  { name: "Maria Rodriguez", role: "Lead Engineer", posts: 12 },
  { name: "James Wilson", role: "Developer Advocate", posts: 6 },
  { name: "Sarah Johnson", role: "Architect", posts: 4 }
]

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || 
      (selectedCategory === "Tutorials" && post.tags.includes("tutorial")) ||
      (selectedCategory === "Technical" && post.tags.includes("technical")) ||
      (selectedCategory === "Announcements" && post.tags.includes("announcement"))
    
    const matchesSearch = searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Columnist Blog</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">The Columnist Blog</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Insights, tutorials, and updates about client-side databases, semantic search, 
            and building modern web applications with Columnist.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md text-sm transition-colors ${
                        selectedCategory === category.name
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="inline-flex items-center px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Featured Authors</h3>
                <div className="space-y-4">
                  {authors.map((author) => (
                    <div key={author.name} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{author.name}</p>
                        <p className="text-xs text-muted-foreground">{author.role}</p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {author.posts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Stay Updated</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get the latest articles and product updates delivered to your inbox.
                </p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button size="sm" className="w-full">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            {filteredPosts.find(post => post.featured) && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Featured Article</h2>
                {filteredPosts
                  .filter(post => post.featured)
                  .map((post) => (
                    <div key={post.id} className="bg-muted/50 rounded-2xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-muted rounded-lg h-48 md:h-full"></div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                              Featured
                            </span>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {post.author}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(post.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {post.readTime}
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="text-2xl font-bold mb-3">
                            <Link 
                              href={`/blog/${post.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          
                          <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                          
                          <div className="flex items-center space-x-2 mb-4">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 text-xs bg-background text-muted-foreground rounded-full"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <Button asChild>
                            <Link href={`/blog/${post.id}`}>
                              Read Article
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* All Posts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {selectedCategory === "All" ? "All Articles" : selectedCategory}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredPosts.length} articles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts
                  .filter(post => !post.featured)
                  .map((post) => (
                    <article key={post.id} className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="bg-muted rounded-lg h-40 mb-4"></div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {post.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">
                        <Link 
                          href={`/blog/${post.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{post.tags.length - 2} more
                            </span>
                          )}
                        </div>
                        
                        <Link 
                          href={`/blog/${post.id}`}
                          className="inline-flex items-center text-sm text-primary hover:underline"
                        >
                          Read more
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}