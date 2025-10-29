"use client";

import { vietnameseWeekdays} from "@/lib/constants/calendar";
import { CalendarEvent } from "@/lib/types/calendar";
import { PlatformIcon } from "@/components/shared/PlatformIcon";

interface MonthlyViewGridProps {
  calendarGrid: any[]; // Bạn có thể định nghĩa kiểu chi tiết hơn sau
  getNoteText: (event: CalendarEvent) => string;
  onDayClick: (cell: any) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, cell: any) => void;
  onNoteDragStart: (e: React.DragEvent, cell: any, event: CalendarEvent) => void;
  onNoteClick: (e: React.MouseEvent, event: CalendarEvent, date: Date) => void;
}

export function MonthlyViewGrid({
  calendarGrid,
  getNoteText,
  onDayClick,
  onDragOver,
  onDrop,
  onNoteDragStart,
  onNoteClick,
}: MonthlyViewGridProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chính xác
  const todayTime = today.getTime();
  
    return (
    <div className="rounded-lg border border-white/10 overflow-hidden mt-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-white/5">
        {vietnameseWeekdays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-white/70 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Day grid */}
      <div className="grid grid-cols-7 grid-rows-5 flex-1 overflow-y-auto">
        {calendarGrid.map((cell, i) => {
            const cellDateTime = new Date(cell.cellDate);
            cellDateTime.setHours(0, 0, 0, 0);
            const isPast = cellDateTime.getTime() < todayTime;
            
            return(
          <div
            key={i}
            className={`relative h-full p-2 transition-colors ${
                isPast ? 'bg-white/5 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'
              } ${
                cell.isClicked ? "border-2 border-[#E33265]" : "border-t border-b border-white/10"
              } ${
                !cell.inCurrentMonth && !isPast ? 'bg-white/10' : ''
              } ${i < 7 ? 'border-t-0' : ''} ${i % 7 === 0 ? 'border-l' : ''} ${i % 7 === 6 ? 'border-r' : ''}
              `}
            onClick={isPast ? undefined : () => onDayClick(cell)}
            onDragOver={isPast ? undefined : onDragOver}
            onDrop={isPast ? undefined : (e) => onDrop(e, cell)}
          >
            <div className={`flex flex-col h-full ${isPast ? 'opacity-50' : ''}`}>
              {/* Today indicator bubble */}
              {cell.isToday && (
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-[#E33265] rounded-full flex items-center justify-center z-10">
                  <div className="text-xs text-white font-medium">
                    {cell.dayNum}
                  </div>
                </div>
              )}
              {/* Day number */}
              <div className={`text-sm font-medium ${
                cell.inCurrentMonth ? 'text-white' : 'text-white/40'
              } ${cell.isToday ? 'ml-6' : ''}`}>
                {!cell.isToday && cell.dayNum}
              </div>
              
              {/* Events list */}
              <div className="mt-1 space-y-1 flex-1 overflow-y-auto scrollbar-hide pr-1">
                {cell.dayEvents.map((event: CalendarEvent, eventIdx: number) => {
                  const label = getNoteText(event);
                  const baseColor = event.noteType === 'green' ? 'bg-[#8AE177]/20 border-[#8AE177]/40 text-[#8AE177]'
                    : event.noteType === 'yellow' ? 'bg-[#FACD5B]/20 border-[#FACD5B]/40 text-[#FACD5B]'
                    : event.noteType === 'red' ? 'bg-[#FF4F4F]/20 border-[#FF4F4F]/40 text-[#FF4F4F]'
                    : 'bg-white/10 border-white/20 text-white/80'
                  const hoverTint = event.noteType === 'green' ? 'hover:bg-[#8AE177]/30'
                    : event.noteType === 'yellow' ? 'hover:bg-[#FACD5B]/30'
                    : event.noteType === 'red' ? 'hover:bg-[#FF4F4F]/30'
                    : 'hover:bg-white/20'
                  const color = `${baseColor} ${hoverTint}`
                  return (
                    <button
                      key={`${cell.clickedKey}-${event.id}`} // Sử dụng event.id để đảm bảo key là duy nhất
                      draggable={true}
                      onDragStart={(e) => onNoteDragStart(e, cell, event)}
                      onClick={(e) => onNoteClick(e, event, cell.cellDate)}
                      className={`inline-flex items-center gap-2 text-[11px] px-2 py-1 rounded-md border w-full h-6 whitespace-nowrap overflow-hidden text-ellipsis ${color}`}
                      title={label}
                      aria-label={`${label} event on ${event.platform}`}
                    >
                      <PlatformIcon platform={event.platform} size={16} variant="inline" />
                      <span style={{ fontFamily: '"Fira Mono", monospace', fontWeight: 500 }}>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}