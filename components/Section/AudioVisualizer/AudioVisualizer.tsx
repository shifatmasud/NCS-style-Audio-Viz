import React, { useRef, useEffect } from 'react';
import { Visualizer } from '../../../three/Visualizer';

interface AudioVisualizerProps {
  analyser: AnalyserNode;
  isPlaying: boolean;
  params: { bloom: number };
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isPlaying, params }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<Visualizer | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      visualizerRef.current = new Visualizer(containerRef.current, analyser);
      visualizerRef.current.init();
    }

    return () => {
      visualizerRef.current?.destroy();
    };
  }, [analyser]);

  useEffect(() => {
    visualizerRef.current?.setPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    visualizerRef.current?.updateParams(params);
  }, [params]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default AudioVisualizer;
