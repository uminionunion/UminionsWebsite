import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Mic } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const CreateBroadcastView = () => {
    const { user } = useAuth();
    // Broadcast state
    const [broadcastName, setBroadcastName] = useState('');
    const [broadcastId, setBroadcastId] = useState<number | null>(null);
    const [userBroadcasts, setUserBroadcasts] = useState<any[]>([]);
    
    // Episode state
    const [episodeName, setEpisodeName] = useState('');
    const [episodeDescription, setEpisodeDescription] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [recordedFile, setRecordedFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<string>('');
    const [tags, setTags] = useState('');
    const [website, setWebsite] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recordingMode, setRecordingMode] = useState<'audio' | 'video' | null>(null);
    const recorderRef = React.useRef<MediaRecorder | null>(null);
    const recordingStreamRef = React.useRef<MediaStream | null>(null);
    const holdTimerRef = React.useRef<number | null>(null);

    // Load user's existing broadcasts
    useEffect(() => {
      const loadBroadcasts = async () => {
        try {
          if (!user?.id) return;
          const res = await fetch(`/api/broadcasts/by-user/${user.id}`, { credentials: 'include' });
          if (res.ok) {
            const broadcasts = await res.json();
            setUserBroadcasts(broadcasts);
          }
        } catch (error) {
          console.error('[CREATE_BROADCAST] Error loading broadcasts:', error);
        }
      };
      loadBroadcasts();
    }, [user?.id]);

    // Generate time options for the dropdown.
    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = String(h).padStart(2, '0');
            const minute = String(m).padStart(2, '0');
            timeOptions.push(`${hour}:${minute}`);
        }
    }

    const uploadFileToStorage = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      return url;
    };

        const startRecording = async (mode: 'audio' | 'video') => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(mode === 'audio' ? { audio: true } : { audio: true, video: true });
                const mimeType = mode === 'audio' && MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'video/webm';
                const recorder = new MediaRecorder(stream, { mimeType });
                const chunks: BlobPart[] = [];
                recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    const extension = mode === 'audio' ? 'webm' : 'webm';
                    setRecordedFile(new File([blob], `recorded-${mode}-${Date.now()}.${extension}`, { type: mimeType }));
                    stream.getTracks().forEach((track) => track.stop());
                    recorderRef.current = null;
                    recordingStreamRef.current = null;
                    setRecordingMode(null);
                };
                recordingStreamRef.current = stream;
                recorderRef.current = recorder;
                recorder.start();
                setRecordingMode(mode);
            } catch (error) {
                console.error('[CREATE_BROADCAST] Recording permission or setup failed:', error);
                alert(`Unable to access your ${mode === 'audio' ? 'microphone' : 'camera and microphone'}.`);
            }
        };

        const stopRecording = () => {
            if (holdTimerRef.current) {
                window.clearTimeout(holdTimerRef.current);
                holdTimerRef.current = null;
            }
            if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
        };

        const handleRecordPointerDown = () => {
            if (recordingMode === 'video') {
                stopRecording();
                return;
            }
            holdTimerRef.current = window.setTimeout(() => startRecording('audio'), 350);
        };

        const handleRecordPointerUp = () => {
            if (recordingMode === 'audio') {
                stopRecording();
            } else if (holdTimerRef.current) {
                window.clearTimeout(holdTimerRef.current);
                holdTimerRef.current = null;
                startRecording('video');
            }
        };

    const handleCreateBroadcast = async () => {
      if (!broadcastName.trim()) {
        alert('Broadcast name is required');
        return;
      }
      try {
        const res = await fetch('/api/broadcasts', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: broadcastName.trim() }),
        });
        if (res.ok) {
          const { id } = await res.json();
          setBroadcastId(id);
          setUserBroadcasts([...userBroadcasts, { id, name: broadcastName }]);
          setBroadcastName('');
        }
      } catch (error) {
        console.error('[CREATE_BROADCAST] Error creating broadcast:', error);
        alert('Failed to create broadcast');
      }
    };

    const handleSubmitEpisode = async () => {
            if (!episodeName.trim()) {
                alert('Episode name is required');
        return;
      }
      if (!date || !time) {
        alert('Date and time required');
        return;
      }

      setIsSubmitting(true);
      try {
                let activeBroadcastId = broadcastId;
                if (!activeBroadcastId) {
                    if (!broadcastName.trim()) throw new Error('Create or select a broadcast first');
                    const broadcastResponse = await fetch('/api/broadcasts', {
                        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: broadcastName.trim() }),
                    });
                    if (!broadcastResponse.ok) throw new Error('Failed to create broadcast');
                    const broadcast = await broadcastResponse.json();
                    activeBroadcastId = broadcast.id;
                    setBroadcastId(broadcast.id);
                    setUserBroadcasts((current) => [...current, { id: broadcast.id, name: broadcastName.trim() }]);
                    setBroadcastName('');
                }

                const media = [];
        let coverImageUrl = null;

        if (mediaFile) {
                    media.push({ url: await uploadFileToStorage(mediaFile), type: mediaFile.type.includes('video') ? 'video' : 'audio' });
                }
                if (recordedFile) {
                    media.push({ url: await uploadFileToStorage(recordedFile), type: recordedFile.type.includes('video') ? 'video' : 'audio' });
        }

        if (coverImageFile) {
          coverImageUrl = await uploadFileToStorage(coverImageFile);
        }

        const scheduledAt = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(time.split(':')[0]), parseInt(time.split(':')[1])).toISOString() : null;

        const res = await fetch(`/api/broadcasts/${activeBroadcastId}/episodes`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: episodeName.trim(),
            description: episodeDescription.trim() || null,
            media,
            cover_image_url: coverImageUrl,
            scheduled_at: scheduledAt,
            tags: tags.trim() || null,
            website: website.trim() || null,
          }),
        });

        if (res.ok) {
          alert('Episode created successfully!');
          setEpisodeName('');
          setEpisodeDescription('');
          setMediaFile(null);
          setRecordedFile(null);
          setCoverImageFile(null);
          setDate(undefined);
          setTime('');
          setTags('');
          setWebsite('');
        } else {
          alert('Failed to create episode');
        }
      } catch (error) {
        console.error('[CREATE_BROADCAST] Error submitting episode:', error);
        alert('Failed to submit episode');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            {/* Left Side: Create Broadcast / First Episode */}
            <div className="border-r pr-8 space-y-4 overflow-y-auto">
                <h4 className="font-bold text-lg">Want to Broadcast something?</h4>
                
                <div>
                    <Label htmlFor="broadcast-name">Broadcast Name</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="broadcast-name" 
                            placeholder="e.g., Union Weekly News" 
                            value={broadcastName}
                            onChange={(e) => setBroadcastName(e.target.value)}
                        />
                        <Button onClick={handleCreateBroadcast} disabled={isSubmitting || !broadcastName.trim()}>
                            Create
                        </Button>
                    </div>
                </div>

                {!broadcastId && userBroadcasts.length > 0 && (
                    <div>
                        <Label>Or Select Existing Broadcast</Label>
                        <Select onValueChange={(val) => setBroadcastId(parseInt(val))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a broadcast" />
                            </SelectTrigger>
                            <SelectContent>
                                {userBroadcasts.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {broadcastId && (
                    <>
                <div>
                    <Label htmlFor="episode-name">Episode Name</Label>
                    <Input 
                        id="episode-name" 
                        placeholder="e.g., Episode 1: The Beginning" 
                        value={episodeName}
                        onChange={(e) => setEpisodeName(e.target.value)}
                    />
                </div>

                <div>
                    <Label>Upload Media</Label>
                    <div className="flex gap-2">
                        <label className="flex-1">
                            <Button variant="outline" className="w-full cursor-pointer" asChild>
                                <span>
                                    <Upload className="mr-2 h-4 w-4" /> 
                                    {mediaFile?.type.includes('video') ? 'Change Video' : 'Audio'}
                                </span>
                            </Button>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="audio/*"
                                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                            />
                        </label>
                        <label className="flex-1">
                            <Button variant="outline" className="w-full cursor-pointer" asChild>
                                <span><Upload className="mr-2 h-4 w-4" /> Video</span>
                            </Button>
                            <input
                                type="file"
                                className="hidden"
                                accept="video/*"
                                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                            />
                        </label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onPointerDown={handleRecordPointerDown}
                                                    onPointerUp={handleRecordPointerUp}
                                                    onPointerCancel={stopRecording}
                                                    onPointerLeave={() => recordingMode === 'audio' && stopRecording()}
                                                >
                                                    <Mic className="mr-2 h-4 w-4" />
                                                    {recordingMode === 'audio' ? 'Release to Stop' : recordingMode === 'video' ? 'Stop Video' : 'Record'}
                                                </Button>
                    </div>
                    {mediaFile && <p className="text-xs text-gray-400 mt-1">Selected: {mediaFile.name}</p>}
                                        {recordedFile && <p className="text-xs text-gray-400 mt-1">Recorded: {recordedFile.name}</p>}
                </div>

                <div>
                    <Label htmlFor="episode-description">Description</Label>
                    <Textarea 
                        id="episode-description" 
                        placeholder="What is this episode about?" 
                        value={episodeDescription}
                        onChange={(e) => setEpisodeDescription(e.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="cover-image">Attach image for Cover Image/Logo?</Label>
                    <Input 
                        id="cover-image" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                    />
                    {coverImageFile && <p className="text-xs text-gray-400 mt-1">Selected: {coverImageFile.name}</p>}
                </div>

                <div>
                    <Label>Extra Images (up to 9)</Label>
                    <Input type="file" multiple accept="image/*" disabled />
                </div>

                <div>
                    <Label>Broadcast Date & Time</Label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Select onValueChange={setTime} value={time}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="tags">Tags (up to 10, comma-separated)</Label>
                    <Input 
                        id="tags" 
                        placeholder="news, community, events"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="website">Optional Website</Label>
                    <Input 
                        id="website" 
                        placeholder="https://example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </div>

                <Button onClick={handleSubmitEpisode} disabled={isSubmitting || !episodeName.trim()}>
                    {isSubmitting ? '...' : 'Submit Episode'}
                </Button>
                    </>
                )}
            </div>

            {/* Right Side: Select Broadcast */}
            <div className="flex flex-col space-y-4">
                <h4 className="font-bold text-lg">Your Broadcasts</h4>
                {userBroadcasts.length > 0 ? (
                    <div className="space-y-2">
                        {userBroadcasts.map((b) => (
                            <Button
                                key={b.id}
                                variant={broadcastId === b.id ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => setBroadcastId(b.id)}
                            >
                                {b.name}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-md p-8 text-center text-muted-foreground">
                        <p>Create a broadcast on the left to get started! (You can create up to 10 broadcasts, with 10 episodes each.)</p>
                    </div>
                )}
            </div>
        </div>
    );
};
