'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Play } from 'lucide-react';

// Mock data for UI demonstration
const mockPrompts = [
  { id: '1', name: 'welcome_email', category: 'marketing', model: 'gemini-1.5-flash', active: true },
  { id: '2', name: 'generate_reorder_email', category: 'operations', model: 'gemini-1.5-flash', active: true },
  { id: '3', name: 'executive_summary', category: 'executive', model: 'gemini-1.5-pro', active: false },
];

export default function PromptsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrompts = mockPrompts.filter(p => p.name.includes(searchTerm));

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Prompt Management</h1>
          <p className="text-muted-foreground mt-1">Manage AI prompt templates and model configurations.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105">
          <Plus className="mr-2 h-4 w-4" /> New Prompt
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Enterprise Prompts</CardTitle>
            <div className="w-72">
              <Input
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map((prompt) => (
                  <TableRow key={prompt.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">{prompt.name}</TableCell>
                    <TableCell className="capitalize">{prompt.category}</TableCell>
                    <TableCell>{prompt.model}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${prompt.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {prompt.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="hover:text-primary">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-blue-500">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
