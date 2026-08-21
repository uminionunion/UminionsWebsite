
import React from 'react';
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

export const CreateBroadcastView = () => {
    // State for the selected date and time.
    // PHP Conversion: In a PHP form, these would just be standard form inputs (`<input type="date">`, `<select>`).
    // The selected values would be sent in the `$_POST` request.
    const [date, setDate] = React.useState<Date>();
    const [time, setTime] = React.useState<string>('');

    // Generate time options for the dropdown.
    // PHP Conversion: This loop could be done in PHP to generate the `<option>` tags for the time select dropdown.
    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = String(h).padStart(2, '0');
            const minute = String(m).padStart(2, '0');
            timeOptions.push(`${hour}:${minute}`);
        }
    }

    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            {/* 
              PHP Conversion Instructions:
              This form would be a standard HTML `<form>` in a `create_broadcast.php` template.
              It would have `method="POST"` and `action="api/broadcasts.php?action=create"`.
              File uploads (MP3/MP4, images) require `enctype="multipart/form-data"` on the form tag and would be handled using PHP's `$_FILES` superglobal on the server.
              The date and time pickers are standard HTML elements.
            */}
            {/* Left Side: Create Broadcast / First Episode */}
            <div className="border-r pr-8 space-y-4 overflow-y-auto">
                <h4 className="font-bold text-lg">Want to Broadcast something?</h4>
                
                <div>
                    <Label htmlFor="broadcast-name">Broadcast Name</Label>
                    <Input id="broadcast-name" placeholder="e.g., Union Weekly News" />
                </div>

                <div>
                    <Label htmlFor="episode-name">Episode Name</Label>
                    <Input id="episode-name" placeholder="e.g., Episode 1: The Beginning" />
                </div>

                <div>
                    <Label>Upload Media</Label>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1"><Upload className="mr-2 h-4 w-4" /> MP3/MP4</Button>
                        <Button variant="outline" className="flex-1"><Mic className="mr-2 h-4 w-4" /> Record</Button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="episode-description">Description</Label>
                    <Textarea id="episode-description" placeholder="What is this episode about?" />
                </div>

                <div>
                    <Label htmlFor="cover-image">Attach image for Cover Image/Logo?</Label>
                    <Input id="cover-image" type="file" accept="image/*" />
                </div>

                <div>
                    <Label>Extra Images (up to 9)</Label>
                    <Input type="file" multiple accept="image/*" />
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
                    <Input id="tags" placeholder="news, community, events" />
                </div>

                <div>
                    <Label htmlFor="website">Optional Website</Label>
                    <Input id="website" placeholder="https://example.com" />
                </div>

                <Button>Submit</Button>
            </div>

            {/* 
              PHP Conversion Instructions:
              This section would be conditionally rendered using a PHP `if` statement in the template.
              Example: `if (user_has_broadcasts($_SESSION['user_id'])) { ... } else { ... }`.
              The dropdown to select a broadcast would be populated by a PHP loop (`foreach`) over the user's broadcasts fetched from the database via a function like `get_user_broadcasts()`.
            */}
            {/* Right Side: Add Another Episode (conditionally rendered) */}
            <div className="flex flex-col space-y-4 text-muted-foreground">
                <h4 className="font-bold text-lg text-foreground">Want to Add Another Episode?</h4>
                <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-md p-8 text-center">
                    <p>Select one of your created broadcasts to add a new episode. (You can create up to 10 broadcasts, with 10 episodes each.)</p>
                </div>
            </div>
        </div>
    );
};
