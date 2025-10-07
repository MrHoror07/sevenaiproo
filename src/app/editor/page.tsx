'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Wand2, 
  Scissors,
  Type,
  Music,
  Volume2,
  Settings,
  Save,
  FileVideo,
  Clock,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function VideoEditor() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);

  useEffect(() => {
    if (!user) {
      window.location.href = '/';
    }
  }, [user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setIsProcessing(true);
      setProcessingProgress(0);
      
      // Simulate processing
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleAIEdit = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate AI processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const tools = [
    { icon: Scissors, name: 'Trim', description: 'Cut and trim your video' },
    { icon: Type, name: 'Text', description: 'Add text and titles' },
    { icon: Music, name: 'Audio', description: 'Add background music' },
    { icon: Volume2, name: 'Volume', description: 'Adjust audio levels' },
    { icon: Wand2, name: 'Effects', description: 'Apply AI effects' },
    { icon: Settings, name: 'Settings', description: 'Video settings' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to access the editor</h1>
          <Button onClick={() => window.location.href = '/'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Video Editor</h1>
            <p className="text-muted-foreground">Create amazing videos with AI</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  {videoFile ? (
                    <div className="text-white text-center">
                      <FileVideo className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg">{videoFile.name}</p>
                      {isProcessing && (
                        <div className="mt-4">
                          <Progress value={processingProgress} className="w-64 mx-auto" />
                          <p className="text-sm mt-2">Processing... {processingProgress}%</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Upload a video to start editing</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Video
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                {videoFile && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <Progress value={(currentTime / duration) * 100} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  {videoFile ? (
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Video timeline will appear here</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Upload a video to see timeline</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Editing Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tools.map((tool, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        disabled={!videoFile}
                      >
                        <tool.icon className="w-6 h-6 mb-2" />
                        <span className="text-xs">{tool.name}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={handleAIEdit}
                  disabled={!videoFile || isProcessing}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Auto Edit
                </Button>
                <p className="text-sm text-muted-foreground">
                  Let AI enhance your video with smart edits and effects
                </p>
                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={processingProgress} />
                    <p className="text-xs text-muted-foreground">
                      AI processing... {processingProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {videoFile ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>File Name:</span>
                      <span className="text-muted-foreground">{videoFile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span className="text-muted-foreground">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-muted-foreground">2:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span className="text-muted-foreground">1920x1080</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No video selected
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Add Subtitles
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Color Correction
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Stabilize Video
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Remove Background
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
