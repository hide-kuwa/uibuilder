import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DataSource {
  name: string;
  baseURL: string;
  headers?: Record<string, string>;
  token?: string;
}

interface DataSourcesContextValue {
  sources: DataSource[];
  setSources: React.Dispatch<React.SetStateAction<DataSource[]>>;
}

const DataSourcesContext = createContext<DataSourcesContextValue | undefined>(undefined);

export const DataSourcesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sources, setSources] = useState<DataSource[]>([]);
  return (
    <DataSourcesContext.Provider value={{ sources, setSources }}>
      {children}
    </DataSourcesContext.Provider>
  );
};

export const useDataSources = () => {
  const ctx = useContext(DataSourcesContext);
  if (!ctx) throw new Error('useDataSources must be used within DataSourcesProvider');
  return ctx;
};

