import { useState, useEffect } from 'react';

export interface Command {
  id: string;
  title: string;
  keywords?: string[];
  run: () => void;
}

let commands: Command[] = [];

const listeners = new Set<(cmds: Command[]) => void>();

function emit() {
  for (const l of listeners) l(commands);
}

export function registerCommand(cmd: Command): () => void {
  commands = [...commands.filter((c) => c.id !== cmd.id), cmd];
  emit();
  return () => {
    commands = commands.filter((c) => c.id !== cmd.id);
    emit();
  };
}

export function useCommands(): Command[] {
  const [cmds, setCmds] = useState<Command[]>(commands);
  useEffect(() => {
    const l = (c: Command[]) => setCmds(c);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return cmds;
}
