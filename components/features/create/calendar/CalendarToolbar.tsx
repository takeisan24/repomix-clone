"use client";

import { Button } from "@/components/ui/button";
import { SOCIAL_PLATFORMS } from "@/lib/constants/platforms";
import { vietnameseMonths } from "@/lib/constants/calendar";
import { needsInversion } from "@/lib/utils/platform";

interface CalendarToolbarProps {
  calendarView: 'monthly' | 'weekly';
  currentMonth: number;
  currentYear: number;
  currentWeekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onSetView: (view: 'monthly' | 'weekly') => void;
  onIconDragStart: (e: React.DragEvent, platform: string) => void;
}

export function CalendarToolbar({
  calendarView,
  currentMonth,
  currentYear,
  currentWeekStart,
  onPrev,
  onNext,
  onSetView,
  onIconDragStart,
}: CalendarToolbarProps) {

  const getWeekRangeLabel = () => {
    const startOfWeek = new Date(currentWeekStart);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const formatDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;
    
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-4 mb-2 mt-1 mr-8">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="w-8 h-8 text-white/80 hover:text-white" onClick={onPrev}>‹</Button>
        <div className="px-4 py-1 rounded-md border border-white/20 bg-white/10 text-white flex items-center justify-center min-w-[180px]">
          {calendarView === 'monthly' ? `${vietnameseMonths[currentMonth]}, ${currentYear}` : getWeekRangeLabel()}
        </div>
        <Button size="icon" variant="ghost" className="w-8 h-8 text-white/80 hover:text-white" onClick={onNext}>›</Button>
      </div>
      
      <div className="flex-grow flex justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 order-last md:order-none w-full md:w-auto mt-4 md:mt-0">
        {SOCIAL_PLATFORMS.map((platform) => (
          <img
            key={platform.name}
            src={platform.icon}
            alt={platform.name}
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 cursor-grab hover:opacity-80 transition-all ${
              needsInversion(platform.name) ? 'filter brightness-0 invert' : ''
            }`}
            draggable
            onDragStart={(e) => onIconDragStart(e, platform.name)}
          />
        ))}
      </div>

      <div className="inline-flex rounded-lg overflow-hidden border border-white/10 ml-auto md:ml-4">
        <Button variant={calendarView === 'monthly' ? 'secondary' : 'ghost'} size="sm" onClick={() => onSetView('monthly')} className={calendarView === 'monthly' ? 'bg-white/10' : ''}>Tháng</Button>
        <Button variant={calendarView === 'weekly' ? 'secondary' : 'ghost'} size="sm" onClick={() => onSetView('weekly')} className={calendarView === 'weekly' ? 'bg-white/10' : ''}>Tuần</Button>
      </div>
    </div>
  );
}