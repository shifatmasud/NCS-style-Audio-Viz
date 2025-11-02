import React, { useRef, useEffect } from 'react';
// FIX: Import VisualizerParams for correct prop typing.
import { Visualizer, VisualizerParams } from '../../three/Visualizer';

interface AudioVisualizerProps {
  analyser: AnalyserNode;
  isPlaying: boolean;
  // FIX: Use the full VisualizerParams type.
  params: VisualizerParams;
  // FIX: Add onSphereClick prop, required by the Visualizer constructor.
  onSphereClick: () => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isPlaying, params, onSphereClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<Visualizer | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // FIX: Pass the missing onSphereClick argument to the Visualizer constructor.
      visualizerRef.current = new Visualizer(containerRef.current, analyser, onSphereClick);
      visualizerRef.current.init();
    }

    return () => {
      visualizerRef.current?.destroy();
    };
  }, [analyser, onSphereClick]);

  useEffect(() => {
    visualizerRef.current?.setPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    visualizerRef.current?.updateParams(params);
  }, [params]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default AudioVisualizer;
