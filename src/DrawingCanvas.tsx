import React, { useRef, useEffect, useState,  useImperativeHandle, forwardRef } from 'react';

interface DrawingCanvasProps {
  image: HTMLImageElement;
  brushColor: string;
  brushSize: number;
}

const DrawingCanvas: React.ForwardRefRenderFunction<unknown, DrawingCanvasProps>  = (  { image, brushColor, brushSize }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [outlineCoordinates, setOutlineCoordinates] = useState<{ x: number; y: number }[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;

    //Set canvas image and length
    canvas.width = image.width;
    canvas.height = image.height;

    // Load image onto canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }, [image]);

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
        clearCanvas();
    },
    downloadCoordinates: () => {
        downloadCoordinates();
      }
  }));

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setOutlineCoordinates((prevCoordinates) => [...prevCoordinates, [{ x, y }]]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();

    setOutlineCoordinates((prevCoordinates) => {
        const lastIndex = prevCoordinates.length - 1;
        const updatedCoordinates = [...prevCoordinates];
        updatedCoordinates[lastIndex] = [...updatedCoordinates[lastIndex], { x, y }];
        return updatedCoordinates;
      });
  };

  const finishDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    setOutlineCoordinates([]);
  }

  const downloadCoordinates = () => {
    
    const coordinatesStringArray = outlineCoordinates.map((outline) => {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
    
        outline.forEach(({ x, y }) => {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        });
    
        return `(${minX},${minY}),(${maxX},${maxY})`;
    });
    const coordinatesString = `[${coordinatesStringArray.join('\n')}]`;
    const element = document.createElement('a');
    const file = new Blob([coordinatesString], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'coordinates.txt';
    document.body.appendChild(element); 
    element.click();
  };  

  return (
    <div       
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        }}>
      <div style={{ margin: 'auto', maxWidth: '100%', maxHeight: '100%' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseOut={finishDrawing}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default forwardRef(DrawingCanvas);
