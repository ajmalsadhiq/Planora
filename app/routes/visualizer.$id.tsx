import React, { useEffect, useState } from "react";
import type { Route } from "./+types/visualizer.$id";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Visualizer - Planora" },
    { name: "description", content: "Visualize your floor plan" },
  ];
}

export default function VisualizerId({ params }: Route.ComponentProps) {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {
    // Retrieve the base64 image data from sessionStorage using the route param id
    const storedImage = sessionStorage.getItem(`image_${id}`);
    
    if (!storedImage) {
      setError("Image not found. Please upload a new image.");
      return;
    }
    
    setBase64Image(storedImage);
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!base64Image) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading image...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Visualizer - {id}</h1>
      <img 
        src={`data:image/png;base64,${base64Image}`} 
        alt="Uploaded floor plan" 
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
}