"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, DatabaseIcon, AIBrainIcon } from "@/components/icons";
import { Search, Plus, MessageSquare, Zap } from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'ai';
  relevance?: number;
}

export function InteractiveDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Welcome to Columnist! Ask me anything about databases.', timestamp: new Date(), sender: 'ai' },
    { id: '2', content: 'How do I set up real-time sync?', timestamp: new Date(), sender: 'user' },
    { id: '3', content: 'You can enable sync by calling db.enableSync() with your server config.', timestamp: new Date(), sender: 'ai' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    { title: "Add Messages", description: "Store chat messages with automatic indexing" },
    { title: "Search Content", description: "Find messages instantly with full-text search" },
    { title: "AI Integration", description: "MCP protocol enables direct AI access" }
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(msg => ({
        ...msg,
        relevance: Math.random() * 100
      }));
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, messages]);

  const addMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        timestamp: new Date(),
        sender: Math.random() > 0.5 ? 'user' : 'ai'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const nextStep = () => {
    setDemoStep((prev) => (prev + 1) % demoSteps.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Demo Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Interactive Demo</h3>
        <p className="text-muted-foreground">Try Columnist's features in real-time</p>
        <div className="flex justify-center mt-4">
          <Badge variant="outline" className="mr-2">
            Step {demoStep + 1}: {demoSteps[demoStep].title}
          </Badge>
          <Button size="sm" onClick={nextStep}>
            <Zap className="h-4 w-4 mr-1" />
            Next Step
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Storage Demo */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DatabaseIcon className="h-5 w-5 mr-2 text-blue-600" />
              Message Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMessage()}
              />
              <Button onClick={addMessage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-48 overflow-y-auto space-y-2 border rounded p-2">
              {messages.slice(-5).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded text-sm ${
                    msg.sender === 'ai' 
                      ? 'bg-blue-100 dark:bg-blue-900/20 ml-4' 
                      : 'bg-gray-100 dark:bg-gray-800 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs">
                      {msg.sender === 'ai' ? '🤖 AI' : '👤 User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1">{msg.content}</p>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground">
              📊 {messages.length} messages stored • ~{(messages.length * 48)} bytes used
            </div>
          </CardContent>
        </Card>

        {/* Search Demo */}
        <Card className="border-teal-200 dark:border-teal-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SearchIcon className="h-5 w-5 mr-2 text-teal-600" />
              Smart Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="h-48 overflow-y-auto space-y-2 border rounded p-2">
              {searchResults.length > 0 ? (
                searchResults.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-2 border rounded text-sm bg-teal-50 dark:bg-teal-900/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs">
                        {msg.sender === 'ai' ? '🤖 AI' : '👤 User'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {msg.relevance?.toFixed(0)}% match
                      </Badge>
                    </div>
                    <p>{msg.content}</p>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="text-center text-muted-foreground py-8">
                  No messages found
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Enter a search query to find messages
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              🔍 Full-text search • TF-IDF scoring • O(k) performance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MCP Integration Demo */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AIBrainIcon className="h-5 w-5 mr-2 text-purple-600" />
            MCP Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold">Direct Access</h4>
              <p className="text-sm text-muted-foreground">AI queries database directly via MCP</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <Search className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold">Semantic Search</h4>
              <p className="text-sm text-muted-foreground">Vector embeddings for context understanding</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold">Real-time</h4>
              <p className="text-sm text-muted-foreground">Live updates for chat applications</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded">
            <p className="text-sm text-center">
              <strong>Try it yourself:</strong> This demo shows how Columnist stores, searches, and provides AI access to your data in real-time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}