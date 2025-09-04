import fs from 'fs';
import path from 'path';
import React from 'react';
import {
  getRegisteredComponents,
} from '../../../../src/features/uibuilder/editor/componentRegistry';
import '../../../../src/features/uibuilder/editor/registerComponents';

interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

interface ComponentDoc {
  name: string;
  description: string;
  props: PropDoc[];
  available: boolean;
}

const docs: ComponentDoc[] = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'public', 'docs', 'components.json'),
    'utf-8'
  )
);

const registry = getRegisteredComponents();

export default function DocsPage() {
  return (
    <div className="p-4 space-y-8">
      {docs.map((doc) => {
        const reg = registry.find((r) => r.component.name === doc.name);
        return (
          <div key={doc.name} className="border p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold">{doc.name}</h2>
              <span className={doc.available ? 'text-green-600' : 'text-red-600'}>
                {doc.available ? '使用可' : '使用不可'}
              </span>
            </div>
            {doc.description && <p className="mb-2">{doc.description}</p>}
            {reg && (
              <div className="mb-2">
                {reg.preview
                  ? reg.preview()
                  : React.createElement(reg.component, reg.defaultProps)}
              </div>
            )}
            {doc.props.length > 0 && (
              <table className="table-auto text-left">
                <thead>
                  <tr>
                    <th className="px-2">Prop</th>
                    <th className="px-2">Type</th>
                    <th className="px-2">Required</th>
                    <th className="px-2">Default</th>
                    <th className="px-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.props.map((p) => (
                    <tr key={p.name}>
                      <td className="px-2">{p.name}</td>
                      <td className="px-2">{p.type}</td>
                      <td className="px-2">{p.required ? 'Yes' : 'No'}</td>
                      <td className="px-2">{p.default ?? ''}</td>
                      <td className="px-2">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

