import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  indent: 2 | 4;
  sortKeys: boolean;
  csvDelimiter: ',' | ';' | '\t';
  csvHeader: boolean;
  csvInferTypes: boolean;
  flattenKeys: boolean;
  autoValidate: boolean;

  setIndent: (indent: 2 | 4) => void;
  setSortKeys: (sortKeys: boolean) => void;
  setCsvDelimiter: (delimiter: ',' | ';' | '\t') => void;
  setCsvHeader: (header: boolean) => void;
  setCsvInferTypes: (inferTypes: boolean) => void;
  setFlattenKeys: (flatten: boolean) => void;
  setAutoValidate: (auto: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      indent: 2,
      sortKeys: false,
      csvDelimiter: ',',
      csvHeader: true,
      csvInferTypes: true,
      flattenKeys: true,
      autoValidate: true,

      setIndent: (indent) => set({ indent }),
      setSortKeys: (sortKeys) => set({ sortKeys }),
      setCsvDelimiter: (delimiter) => set({ csvDelimiter: delimiter }),
      setCsvHeader: (header) => set({ csvHeader: header }),
      setCsvInferTypes: (inferTypes) => set({ csvInferTypes: inferTypes }),
      setFlattenKeys: (flatten) => set({ flattenKeys: flatten }),
      setAutoValidate: (auto) => set({ autoValidate: auto }),
    }),
    { name: 'jsw-settings' },
  ),
);
