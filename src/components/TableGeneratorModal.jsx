import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Table, Plus, Minus, Trash2 } from 'lucide-react';

const TableGeneratorModal = ({ isOpen, onClose, onInsert }) => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [headers, setHeaders] = useState([
    { name: 'Concepto', isKeyword: false }, 
    { name: 'Información', isKeyword: false }
  ]);


  useEffect(() => {
    if (isOpen) {
      setRows(2);
      setCols(2);
      setHeaders([
        { name: 'Concepto', isKeyword: false }, 
        { name: 'Información', isKeyword: false }
      ]);
    }
  }, [isOpen]);


  const handleColsChange = (newCols) => {
    const validCols = Math.max(1, Math.min(10, newCols));
    setCols(validCols);
    
    // Adjust headers array
    setHeaders(prev => {
      if (validCols > prev.length) {
        return [...prev, ...Array(validCols - prev.length).fill('').map((_, i) => ({ 
          name: `Columna ${prev.length + i + 1}`, 
          isKeyword: false 
        }))];
      } else {
        return prev.slice(0, validCols);
      }
    });

  };

  const handleHeaderChange = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], name: value };
    setHeaders(newHeaders);
  };

  const toggleHeaderKeyword = (index) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], isKeyword: !newHeaders[index].isKeyword };
    setHeaders(newHeaders);
  };


  const generateMarkdownTable = () => {
    const headerRow = headers.map(h => h.isKeyword ? `{${h.name}}` : h.name);
    let markdown = '\n| ' + headerRow.join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    for (let r = 0; r < rows; r++) {
      markdown += '| ' + headers.map(h => {
          const baseName = h.name.replace(/\s+/g, '_').replace(/[^\w]/g, '');
          return `{${baseName || 'campo'}_${r + 1}}`;
      }).join(' | ') + ' |\n';
    }
    
    onInsert(markdown);
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-800">
            <Table className="w-5 h-5" /> Configurar Tabla
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 my-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Filas (Estructura)</Label>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={() => setRows(Math.max(1, rows - 1))}
                className="h-8 w-8"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Input 
                type="number" 
                value={rows} 
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-16 h-8 text-center font-bold"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={() => setRows(Math.min(20, rows + 1))}
                className="h-8 w-8"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 italic">Número de filas de datos que tendrá la tabla</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Columnas</Label>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={() => handleColsChange(cols - 1)}
                className="h-8 w-8"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Input 
                type="number" 
                value={cols} 
                onChange={(e) => handleColsChange(parseInt(e.target.value) || 1)} 
                className="w-16 h-8 text-center font-bold"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={() => handleColsChange(cols + 1)}
                className="h-8 w-8"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 italic">Número de columnas de la tabla (máx 10)</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Label className="text-xs font-bold uppercase text-slate-500">Encabezados de Columna</Label>
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {headers.map((header, index) => (
              <div key={index} className="flex flex-col gap-1 p-2 border rounded-md bg-slate-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Columna {index + 1}</span>
                  <button 
                    type="button"
                    onClick={() => toggleHeaderKeyword(index)}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${header.isKeyword ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {header.isKeyword ? '{ VARIABLE }' : 'TEXTO'}
                  </button>
                </div>
                <Input
                  value={header.name}
                  onChange={(e) => handleHeaderChange(index, e.target.value)}
                  placeholder={`Header ${index + 1}`}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          <Button onClick={generateMarkdownTable} type="button" className="bg-blue-800 hover:bg-blue-900 text-white font-bold">
            Insertar Tabla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableGeneratorModal;
