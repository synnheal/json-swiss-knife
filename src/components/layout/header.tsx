'use client';

import { useTranslations } from 'next-intl';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { Button } from '@/components/ui/button';
import type { ToolName } from '@/types/worker';
import {
  Braces,
  CheckCircle,
  GitCompare,
  FileJson,
  ArrowLeftRight,
  Wrench,
} from 'lucide-react';

const tools: { name: ToolName; icon: React.ReactNode }[] = [
  { name: 'format', icon: <Braces className="h-4 w-4" /> },
  { name: 'validate', icon: <CheckCircle className="h-4 w-4" /> },
  { name: 'diff', icon: <GitCompare className="h-4 w-4" /> },
  { name: 'schema', icon: <FileJson className="h-4 w-4" /> },
  { name: 'convert', icon: <ArrowLeftRight className="h-4 w-4" /> },
  { name: 'fix', icon: <Wrench className="h-4 w-4" /> },
];

export function Header() {
  const t = useTranslations('tools');
  const { activeTool, setActiveTool } = useWorkspaceStore();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-1">
        <span className="mr-3 text-sm font-bold tracking-tight">
          JSON Swiss Knife
        </span>
        <nav className="flex items-center gap-0.5">
          {tools.map(({ name, icon }) => (
            <Button
              key={name}
              variant={activeTool === name ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs"
              onClick={() => setActiveTool(name)}
            >
              {icon}
              <span className="hidden sm:inline">{t(name)}</span>
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
