import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import DrawingCanvas from './DrawingCanvas';

const App: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const [brushColor, setBrushColor] = useState<string>('black');
  const [brushSize, setBrushSize] = useState<number>(5);

  const drawingCanvasRef = useRef<any>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const img = new Image();
          img.src = reader.result as string;
          img.onload = () => {
            setImage(img);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (drawingCanvasRef.current) {
      drawingCanvasRef.current.downloadCoordinates(); // Call downloadCoordinates method on DrawingCanvas component
    }
  };


  const handleClearCanvas = () => {
    if (drawingCanvasRef.current) {
      drawingCanvasRef.current.clearCanvas(); // Call clearCanvas method on DrawingCanvas component
    }
  };

  return (
    <div className="App">
      <div className="background-image">
        <div className="title">
          <h1> Play With Rocks</h1>
        </div>
        <div className="container">
          <div className="image-container">
            {image && 
            ( 
              <DrawingCanvas
              ref={drawingCanvasRef}
              image={image}
              brushColor={brushColor}
              brushSize={brushSize}
            />)}
          </div>
          <div className="options-container">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <label htmlFor='brush'> Brush Color </label>
            <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
            <label htmlFor='brush'> Brush Size </label>
            <input type="range" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} min="1" max="10" />
            <button onClick={handleClearCanvas}>Clear</button>
            <button onClick={handleDownload}>Download Coordinates</button>
         </div>
        </div>
      </div>
    </div>
  );
};

export default App;
