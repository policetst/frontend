// components/CroquisPolicial.jsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Transformer, Group, Path } from 'react-konva';
import { 
  ELEMENT_CATEGORIES, 
  getElementsByCategory, 
  createElementInstance 
} from './CroquisElements';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Trash2, 
  Download, 
  Save,
  Grid3x3
} from 'lucide-react';

const CroquisPolicial = forwardRef(({ 
  initialData = null, 
  onSave, 
  readOnly = false 
}, ref) => {
  const [elements, setElements] = useState(initialData?.elements || []);
  const [selectedId, setSelectedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('personas');
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const containerRef = useRef(null);

  // Expose stageRef to parent component
  useImperativeHandle(ref, () => ({
    stageRef
  }));

  // Update stage size on container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(600, window.innerHeight - 300);
        setStageSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const handleDragStart = (elementId, x = null, y = null) => {
    if (readOnly) return;
    
    // Use provided coordinates or default to center of stage
    const posX = x !== null ? x : stageSize.width / (2 * scale);
    const posY = y !== null ? y : stageSize.height / (2 * scale);
    
    const newElement = createElementInstance(
      elementId,
      posX,
      posY
    );
    
    if (newElement) {
      setElements([...elements, newElement]);
      setSelectedId(newElement.instanceId);
    }
  };

  const handleElementClick = (instanceId) => {
    if (readOnly) return;
    setSelectedId(instanceId);
  };

  const handleStageClick = (e) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const handleElementDragEnd = (instanceId, e) => {
    if (readOnly) return;
    
    const newElements = elements.map(el => {
      if (el.instanceId === instanceId) {
        return {
          ...el,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return el;
    });
    setElements(newElements);
  };

  const handleTransformEnd = (instanceId, e) => {
    if (readOnly) return;
    
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    const newElements = elements.map(el => {
      if (el.instanceId === instanceId) {
        return {
          ...el,
          x: node.x(),
          y: node.y(),
          rotation,
          scaleX,
          scaleY
        };
      }
      return el;
    });
    setElements(newElements);
  };

  const handleDeleteSelected = () => {
    if (!selectedId || readOnly) return;
    setElements(elements.filter(el => el.instanceId !== selectedId));
    setSelectedId(null);
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.5));
  };

  const handleResetView = () => {
    setScale(1);
    if (stageRef.current) {
      stageRef.current.position({ x: 0, y: 0 });
      stageRef.current.batchDraw();
    }
  };

  const handleClearAll = () => {
    if (readOnly) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los elementos?')) {
      setElements([]);
      setSelectedId(null);
    }
  };

  const handleSave = () => {
    if (onSave) {
      const data = {
        elements,
        version: '1.0',
        timestamp: new Date().toISOString()
      };
      onSave(data);
    }
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `croquis-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderElement = (element) => {
    const commonProps = {
      id: element.instanceId,
      x: element.x,
      y: element.y,
      rotation: element.rotation || 0,
      scaleX: element.scaleX || 1,
      scaleY: element.scaleY || 1,
      draggable: !readOnly,
      onClick: () => handleElementClick(element.instanceId),
      onDragEnd: (e) => handleElementDragEnd(element.instanceId, e),
      onTransformEnd: (e) => handleTransformEnd(element.instanceId, e)
    };

    // SVG Path rendering
    if (element.svgPath) {
      return (
        <Group key={element.instanceId} {...commonProps}>
          <Path
            data={element.svgPath}
            fill={element.color}
            stroke={element.strokeColor || '#000'}
            strokeWidth={2}
            scaleX={element.width / 24}
            scaleY={element.height / 24}
          />
          {element.label && (
            <Text
              text={element.customLabel || element.label}
              fontSize={10}
              fill={element.labelColor || '#fff'}
              fontStyle="bold"
              align="center"
              y={element.height + 5}
              width={element.width}
            />
          )}
        </Group>
      );
    }

    switch (element.shape) {
      case 'circle':
        return (
          <Group key={element.instanceId} {...commonProps}>
            <Circle
              radius={element.width / 2}
              fill={element.color}
              stroke={element.strokeColor || '#000'}
              strokeWidth={2}
            />
            <Text
              text={element.customLabel || element.label}
              fontSize={14}
              fill={element.labelColor || '#fff'}
              fontStyle="bold"
              align="center"
              verticalAlign="middle"
              offsetX={element.width / 4}
              offsetY={7}
            />
          </Group>
        );
      
      case 'rect':
        return (
          <Group key={element.instanceId} {...commonProps}>
            <Rect
              width={element.width}
              height={element.height}
              fill={element.color}
              stroke={element.strokeColor || '#000'}
              strokeWidth={2}
              cornerRadius={3}
            />
            <Text
              text={element.customLabel || element.label}
              fontSize={10}
              fill={element.labelColor || '#fff'}
              fontStyle="bold"
              align="center"
              verticalAlign="middle"
              width={element.width}
              height={element.height}
              offsetY={-element.height / 2 + 5}
            />
          </Group>
        );
      
      case 'line':
        return (
          <Line
            key={element.instanceId}
            {...commonProps}
            points={[0, 0, element.width, 0]}
            stroke={element.color}
            strokeWidth={element.height}
          />
        );
      
      case 'polygon':
        const sides = element.sides || 8;
        const radius = element.width / 2;
        const points = [];
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          points.push(radius + radius * Math.cos(angle));
          points.push(radius + radius * Math.sin(angle));
        }
        return (
          <Group key={element.instanceId} {...commonProps}>
            <Line
              points={points}
              fill={element.color}
              stroke={element.strokeColor || '#000'}
              strokeWidth={3}
              closed={true}
            />
            <Text
              text={element.customLabel || element.label}
              fontSize={12}
              fill={element.labelColor || '#fff'}
              fontStyle="bold"
              align="center"
              x={radius / 2}
              y={radius - 6}
            />
          </Group>
        );
      
      case 'triangle':
        const size = element.width;
        return (
          <Group key={element.instanceId} {...commonProps}>
            <Line
              points={[size / 2, 0, 0, size, size, size]}
              fill={element.color}
              stroke={element.strokeColor || '#000'}
              strokeWidth={2}
              closed={true}
            />
            <Text
              text={element.customLabel || element.label}
              fontSize={16}
              fill={element.labelColor || '#000'}
              align="center"
              x={size / 4}
              y={size / 2}
            />
          </Group>
        );
      
      case 'striped-rect':
        return (
          <Group key={element.instanceId} {...commonProps}>
            <Rect
              width={element.width}
              height={element.height}
              fill={element.color}
              stroke={element.strokeColor || '#000'}
              strokeWidth={2}
            />
            {/* Zebra stripes */}
            {[...Array(Math.floor(element.width / 10))].map((_, i) => (
              <Rect
                key={i}
                x={i * 10}
                y={0}
                width={5}
                height={element.height}
                fill="#000"
              />
            ))}
          </Group>
        );
      
      default:
        return null;
    }
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 50;
    const lines = [];
    const width = stageSize.width / scale;
    const height = stageSize.height / scale;

    // Vertical lines
    for (let i = 0; i < width / gridSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, height]}
          stroke="#e5e7eb"
          strokeWidth={1 / scale}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i < height / gridSize; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, width, i * gridSize]}
          stroke="#e5e7eb"
          strokeWidth={1 / scale}
        />
      );
    }

    return lines;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Croquis Policial</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-200 transition-colors`}
              title="Mostrar/Ocultar cuadrícula"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              title="Alejar"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              title="Acercar"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleResetView}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              title="Restablecer vista"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            {!readOnly && selectedId && (
              <button
                onClick={handleDeleteSelected}
                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                title="Eliminar seleccionado"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={handleExport}
              className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
              title="Exportar como imagen"
            >
              <Download className="w-5 h-5" />
            </button>
            
            {!readOnly && onSave && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Guardar
              </button>
            )}
          </div>
        </div>

        {/* Element Categories */}
        {!readOnly && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {Object.entries(ELEMENT_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        )}

        {/* Element Palette */}
        {!readOnly && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {getElementsByCategory(activeCategory).map(element => (
              <button
                key={element.id}
                onClick={() => handleDragStart(element.id)}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                title={element.name}
              >
                <div 
                  className="w-10 h-10 rounded flex items-center justify-center text-2xl mb-1"
                  style={{ backgroundColor: element.color + '20' }}
                >
                  {element.icon}
                </div>
                <span className="text-xs text-gray-700 text-center">{element.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{ cursor: readOnly ? 'default' : 'crosshair' }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={stageSize.width / scale}
              height={stageSize.height / scale}
              fill="#ffffff"
            />
            
            {/* Grid */}
            {renderGrid()}
            
            {/* Elements */}
            {elements.map(element => renderElement(element))}
            
            {/* Transformer for selected element */}
            {!readOnly && <Transformer ref={transformerRef} />}
          </Layer>
        </Stage>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Cómo usar el croquis</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Haz clic en un elemento de la paleta para añadirlo al centro del canvas</li>
          <li>Arrastra los elementos para posicionarlos</li>
          <li>Selecciona un elemento para rotarlo o redimensionarlo</li>
          <li>Usa los controles de zoom para ajustar la vista</li>
          <li>Exporta el croquis como imagen para incluirlo en informes</li>
        </ul>
      </div>
    </div>
  );
});

CroquisPolicial.displayName = 'CroquisPolicial';

export default CroquisPolicial;
