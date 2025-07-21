import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Video, PlayCircle } from 'lucide-react';

const VideoGridTab = ({ profileId, profileName }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_videos')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Erro ao buscar vídeos da galeria:", error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Nenhum vídeo na galeria</h3>
        <p className="text-gray-500">Este perfil ainda não adicionou vídeos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-lg shadow-md bg-black"
        >
          <video
            src={video.video_url}
            className="w-full h-full object-cover"
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-white" />
          </div>
          {video.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-xs truncate">{video.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VideoGridTab;