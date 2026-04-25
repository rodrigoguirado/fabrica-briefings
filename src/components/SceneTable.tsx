'use client';

import type { Scene } from '@/types/briefing';
import { EditableField } from './EditableField';

interface SceneTableProps {
  scenes: Scene[];
  editable?: boolean;
  headerLabel?: string; // LOCUÇÃO or NARRAÇÃO
  onChange?: (scenes: Scene[]) => void;
}

export function SceneTable({ scenes, editable = false, headerLabel = 'LOCUÇÃO', onChange }: SceneTableProps) {
  function updateScene(index: number, field: keyof Scene, value: string) {
    if (!onChange) return;
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy-900 text-white">
            <th className="px-3 py-2.5 text-center font-semibold w-12">#</th>
            <th className="px-3 py-2.5 text-left font-semibold" style={{ width: '37%' }}>CENA</th>
            <th className="px-3 py-2.5 text-left font-semibold" style={{ width: '22%' }}>LETTERING</th>
            <th className="px-3 py-2.5 text-left font-semibold" style={{ width: '36%' }}>{headerLabel}</th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((scene, i) => (
            <tr key={scene.scene_number} className={i % 2 === 0 ? 'bg-navy-50' : 'bg-white'}>
              <td className="px-3 py-2.5 text-center font-bold text-navy-900">{scene.scene_number}</td>
              <td className="px-3 py-2.5">
                <EditableField
                  value={scene.visual_sequence}
                  onChange={(v) => updateScene(i, 'visual_sequence', v)}
                  editable={editable}
                  className="text-sm text-gray-800"
                  placeholder="Descrição da cena..."
                  multiline
                />
              </td>
              <td className="px-3 py-2.5">
                <EditableField
                  value={scene.lettering}
                  onChange={(v) => updateScene(i, 'lettering', v)}
                  editable={editable}
                  className="text-sm font-semibold text-navy-900"
                  placeholder="—"
                />
              </td>
              <td className="px-3 py-2.5">
                <EditableField
                  value={scene.example}
                  onChange={(v) => updateScene(i, 'example', v)}
                  editable={editable}
                  className="text-sm italic text-gray-700"
                  placeholder="Texto da locução..."
                  multiline
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
