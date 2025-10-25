"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { vietnameseMonths, vietnameseWeekdays, getDaysInMonth, getCalendarEventsForDay, CalendarEvent, SOCIAL_PLATFORMS, getPlatformIcon, needsInversion } from "@/lib"
import { PlatformIcon } from "@/components/shared/PlatformIcon"

import { useCreatePageStore } from "@/store/createPageStore"; // <-- IMPORT STORE
import { useShallow } from 'zustand/react/shallow'; // <-- IMPORT useShallow


/**
 * Calendar section component for scheduling and viewing posts
 * Displays a monthly calendar with drag-and-drop functionality for social media platforms
 */
export default function CalendarSection() {
  // Lấy và sử dụng các trạng thái từ store với useShallow để tránh re-render không cần thiết
  const { calendarEvents, 
    addEvent,
    updateEvent,
    deleteEvent,
    clearAllEvents} = useCreatePageStore(
    useShallow((state) => ({
      calendarEvents: state.calendarEvents,
      addEvent: state.handleEventAdd,
      updateEvent: state.handleEventUpdate,
      deleteEvent: state.handleEventDelete,
      clearAllEvents: state.handleClearCalendarEvents,
      
    }))
  );

  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly'>("monthly")
  
  const getMondayOfCurrentWeek = useCallback(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek 
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() + daysToMonday)
    startOfWeek.setHours(0, 0, 0, 0)
    return startOfWeek
  }, []);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMondayOfCurrentWeek())
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate())
  const [clickedDays, setClickedDays] = useState<Set<string>>(new Set())
  const [showPopup, setShowPopup] = useState<{x: number, y: number, event: CalendarEvent, year: number, month: number, day: number, isEditingTime?: boolean} | null>(null) // Thêm isEditingTime
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // State cho form chỉnh sửa thời gian
  const [editingHour, setEditingHour] = useState<number>(9);
  const [editingMinute, setEditingMinute] = useState<number>(0);
  const [editingAmPm, setEditingAmPm] = useState<'AM' | 'PM'>('AM');


  // Helper to format time to 12-hour AM/PM
  const formatTimeTo12Hour = (timeStr: string | undefined): string => {
    if (!timeStr) return "N/A"
    try {
      const [hh, mm] = timeStr.split(':')
      const hour24 = parseInt(hh || '0', 10)
      const amPm: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM'
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
      return `${String(hour12).padStart(2, '0')}:${(mm || '00').padStart(2, '0')} ${amPm}`
    } catch {
      return timeStr // Fallback if parsing fails
    }
  }

  // Helper to convert 24-hour time string to AM/PM components
  const convert24HourToAmPm = (timeStr: string) => {
    const [hh, mm] = timeStr.split(':');
    let hour = parseInt(hh, 10);
    const minute = parseInt(mm, 10);
    const ampm: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12; // 00:XX -> 12:XX AM
    return { hour, minute, ampm };
  };

  // Helper to convert AM/PM components to 24-hour time string
  const convertAmPmTo24Hour = (hour: number, minute: number, ampm: 'AM' | 'PM') => {
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour24 = 0; // 12 AM is 00:XX
    }
    return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // Navigation functions
  const goPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(currentYear - 1)
        return 11
      }
      return prev - 1
    })
  }

  const goNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(currentYear + 1)
        return 0
      }
      return prev + 1
    })
  }

  // Weekly navigation functions
  const goPrevWeek = () => {
    setCurrentWeekStart(prev => {
      const newWeekStart = new Date(prev)
      newWeekStart.setDate(prev.getDate() - 7)
      return newWeekStart
    })
  }

  const goNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newWeekStart = new Date(prev)
      newWeekStart.setDate(prev.getDate() + 7)
      return newWeekStart
    })
  }

  // Drag and drop handlers
  const handleIconDragStart = (e: React.DragEvent, platform: string) => {
    e.dataTransfer.setData('text/plain', platform)
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleCalendarDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/json') ? 'move' : 'copy';
  }

  const handleCalendarDrop = (e: React.DragEvent, day: number, year: number, month: number) => {
    e.preventDefault()
    
    const platform = e.dataTransfer.getData('text/plain')
    if (platform) {
      addEvent(year, month, day, platform);
    } 
    else if (e.dataTransfer.types.includes('application/json')) {
      try {
        const { event: draggedEvent, oldYear, oldMonth, oldDay } = JSON.parse(e.dataTransfer.getData('application/json'));
        
        if (draggedEvent) {
          const newTime = draggedEvent.time; 
          updateEvent(oldYear, oldMonth, oldDay, draggedEvent, year, month, day, draggedEvent.time);
        }
      } catch (error) {
        console.error("Error parsing dragged event data:", error);
      }
    }
  }

  // Calendar note drag handlers
  const handleCalendarNoteDragStart = (e: React.DragEvent, day: number, year: number, month: number, event: CalendarEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ event, oldYear: year, oldMonth: month, oldDay: day }));
    e.dataTransfer.dropEffect = 'move'
  }

  const handleCalendarNoteDragEnd = (e: React.DragEvent) => {
    // Optional: Add logic here if needed after a drag ends
  };


  // Generate calendar grid (Monthly View)
  const generateCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7 // Monday-first index (0 for Mon, 6 for Sun)
    
    const totalCells = 42; 
    const gridDays = [];

    let currentDay = new Date(currentYear, currentMonth, 1);
    currentDay.setDate(currentDay.getDate() - firstDayIndex); 

    for (let i = 0; i < totalCells; i++) {
        const cellDate = new Date(currentDay); 
        
        const dayNum = cellDate.getDate();
        const inCurrentMonth = cellDate.getMonth() === currentMonth;
        const isToday =
            cellDate.getDate() === new Date().getDate() &&
            cellDate.getMonth() === new Date().getMonth() &&
            cellDate.getFullYear() === new Date().getFullYear();
        
        const isSelected = 
            selectedYear === cellDate.getFullYear() &&
            selectedMonth === cellDate.getMonth() &&
            selectedDay === dayNum;
        
        const clickedKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${dayNum}`;
        const isClicked = clickedDays.has(clickedKey);
        
        const dayEvents = getCalendarEventsForDay(cellDate.getFullYear(), cellDate.getMonth(), dayNum, calendarEvents);
        
        gridDays.push({
            dayNum,
            inCurrentMonth,
            isSelected,
            isClicked,
            clickedKey,
            dayEvents,
            cellDate,
            isToday
        });

        currentDay.setDate(currentDay.getDate() + 1); 
    }
    return gridDays;
  }

  const calendarGrid = generateCalendarGrid()

  // Get the correct text for calendar notes based on type and conditions
  const getNoteText = (event: CalendarEvent) => {
    const formattedTime = event.time ? formatTimeTo12Hour(event.time) : '';
    switch (event.noteType) {
      case 'green':
        return `Đã đăng ${formattedTime}`.trim();
      case 'yellow':
        const hasContent = !!(event.content || (event.status || '').toLowerCase().includes('scheduled') || event.status === 'Draft' || event.status === 'Pending');
        if (!hasContent && !event.time) { // Both content and time are missing
          return 'Trống';
        }
        if (hasContent && !event.time) { // Has content but no scheduled time
          return 'Không có lịch trình thời gian';
        }
        return `Sẽ đăng ${formattedTime}`.trim();
      case 'red':
        return `Thất bại ${formattedTime}`.trim();
      default:
        return `${event.platform} - ${formattedTime}`.trim();
    }
  }

  // Handle calendar note click to show popup
  const handleNoteClick = (e: React.MouseEvent, event: CalendarEvent, date: Date) => {
    e.stopPropagation()
    setShowPopup({
      x: e.clientX,
      y: e.clientY,
      event: event,
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      isEditingTime: false // Mặc định không chỉnh sửa thời gian
    })
    setShowDeleteConfirm(false)
  }

  // Trigger create flow in editor from calendar popup
  const handleOpenCreateFromCalendar = (event: CalendarEvent) => {
    const isGreen = event.noteType === 'green' || (event.status || '').toLowerCase() === 'posted'
    const url = (event as any).url as string | undefined 
    if (isGreen) {
      const fallback = `https://${(event.platform || '').toLowerCase()}.com/`
      try { window.open(url || fallback, '_blank') } catch(err) { console.error("Failed to open URL:", err) }
    } else {
      const platform = (event.platform || '').toLowerCase()
      // Sử dụng id của event để định danh
      router.push(`/create?section=create&platform=${encodeURIComponent(platform)}&eventId=${encodeURIComponent(event.id)}`) 
    }
    closePopup()
  }

  // Close popup
  const closePopup = () => {
    setShowPopup(null)
  }

  // Centralized delete logic
  const handleDeleteEvent = () => {
    if (!showPopup) return;
    const { year, month, day, event: eventToDelete } = showPopup;

    // Call the parent handler to delete the event from the source of truth
    deleteEvent(year, month, day, eventToDelete);

    setShowDeleteConfirm(false);
    setShowPopup(null);
  };

  // Hàm để chuyển đổi sang chế độ chỉnh sửa thời gian
  const handleEditTimeClick = () => {
    if (showPopup && showPopup.event.time) {
      const { hour, minute, ampm } = convert24HourToAmPm(showPopup.event.time);
      setEditingHour(hour);
      setEditingMinute(minute);
      setEditingAmPm(ampm);
    } else {
        // Mặc định giờ nếu không có thời gian ban đầu
        setEditingHour(9);
        setEditingMinute(0);
        setEditingAmPm('AM');
    }
    setShowPopup(prev => prev ? { ...prev, isEditingTime: true } : null);
  };

  // Hàm để lưu thời gian đã chỉnh sửa
  const handleSaveTimeEdit = () => {
    if (!showPopup) return;

    const new24HourTime = convertAmPmTo24Hour(editingHour, editingMinute, editingAmPm);
    updateEvent(
      showPopup.year, 
      showPopup.month, 
      showPopup.day, 
      showPopup.event, 
      showPopup.year, 
      showPopup.month, 
      showPopup.day, 
      new24HourTime
    );
    closePopup(); // Đóng popup sau khi lưu
  };


  // Generate week days for weekly view based on currentWeekStart
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentWeekStart)
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDays.push(date)
    }
    return weekDays
  }

  // Clear all events handler
  const handleClearAllEvents = () => {
    clearAllEvents();
  };

  return (
    <div className="w-full max-w-none mx-4 mt-[30px]">
      {/* Calendar toolbar */}
      <div className="flex items-center justify-between mb-6 -mt-2.5">
        <div className="flex items-center gap-3">
          {/* Month/Week selector */}
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 text-white/80 hover:text-white" 
              onClick={calendarView === 'monthly' ? goPrevMonth : goPrevWeek}
              aria-label={calendarView === 'monthly' ? "Previous month" : "Previous week"}
            >
              ‹
            </Button>
            <div className="px-4 py-1 rounded-md border border-white/20 bg-white/10 text-white flex items-center justify-center">
              {calendarView === 'monthly' 
                ? `${vietnameseMonths[currentMonth]}, ${currentYear}`
                : (() => {
                    // Calculate week range for weekly view using currentWeekStart
                    const startOfWeek = new Date(currentWeekStart)
                    const endOfWeek = new Date(startOfWeek)
                    endOfWeek.setDate(startOfWeek.getDate() + 6)
                    
                    const formatDate = (date: Date) => {
                      const day = date.getDate()
                      const month = date.getMonth() + 1
                      return `${day}/${month}`
                    }
                    
                    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`
                  })()
              }
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 text-white/80 hover:text-white" 
              onClick={calendarView === 'monthly' ? goNextMonth : goNextWeek}
              aria-label={calendarView === 'monthly' ? "Next month" : "Next week"}
            >
              ›
            </Button>
          </div>
        </div>

        {/* Social media icons */}
        <div className="flex items-center gap-[30px] -ml-[70px]">
          {SOCIAL_PLATFORMS.map((platform) => (
            <img
              key={platform.name}
              src={platform.icon}
              alt={platform.name}
              className={`w-[36px] h-[36px] cursor-grab hover:opacity-80 transition-opacity ${
                needsInversion(platform.name) ? 'filter brightness-0 invert' : ''
              }`}
              draggable
              onDragStart={(e) => handleIconDragStart(e, platform.name)}
              aria-label={`Drag to schedule a post on ${platform.name}`}
            />
          ))}
        </div>

        {/* View toggle */}
        <div className="inline-flex rounded-md overflow-hidden border border-white/10">
          <Button
            variant={calendarView === 'monthly' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setCalendarView('monthly')}
            className={calendarView === 'monthly' ? 'bg-white/10' : ''}
          >
            Tháng
          </Button>
          <Button
            variant={calendarView === 'weekly' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setCalendarView('weekly')}
            className={calendarView === 'weekly' ? 'bg-white/10' : ''}
          >
            Tuần
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      {calendarView === 'monthly' && (
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
            {calendarGrid.map((cell, i) => (
              <div
                key={i}
                className={`relative h-full p-2 cursor-pointer ${
                  cell.isClicked ? "border-2 border-[#E33265]" : "border-t border-b border-white/10"
                } ${
                  cell.isSelected ? "outline-2 outline-[#E33265]/60" : ""
                } ${!cell.inCurrentMonth ? 'bg-white/5' : ''} ${i < 7 ? 'border-t-0' : ''} ${i % 7 === 0 ? 'border-l border-white/10' : ''} ${i % 7 === 6 ? 'border-r border-white/10' : ''}
                `}
                onClick={() => {
                  setSelectedYear(cell.cellDate.getFullYear())
                  setSelectedMonth(cell.cellDate.getMonth())
                  setSelectedDay(cell.dayNum)
                  setClickedDays(new Set([cell.clickedKey]))
                  closePopup() // Close any open popups when selecting a new day
                }}
                onDragOver={handleCalendarDragOver}
                onDrop={(e) => handleCalendarDrop(e, cell.dayNum, cell.cellDate.getFullYear(), cell.cellDate.getMonth())}
              >
                <div className="flex flex-col h-full">
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
                  } ${cell.isToday ? 'ml-6' : ''}`}> {/* Adjust margin for today bubble */}
                    {!cell.isToday && cell.dayNum}
                  </div>
                  
                  {/* Events list (individually scrollable per day cell) */}
                  <div className="mt-1 space-y-1 flex-1 overflow-y-auto scrollbar-hide pr-1">
                    {cell.dayEvents.map((event, eventIdx) => {
                      const label = getNoteText(event); // Use the new getNoteText helper
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
                          key={`${cell.clickedKey}-${event.platform}-${event.time}-${eventIdx}`} // More robust key
                          draggable={true} // Allow dragging all event notes
                          onDragStart={(e) => handleCalendarNoteDragStart(e, cell.dayNum, cell.cellDate.getFullYear(), cell.cellDate.getMonth(), event)}
                          onDragEnd={handleCalendarNoteDragEnd}
                          onClick={(e) => handleNoteClick(e, event, cell.cellDate)}
                          className={`inline-flex items-center gap-2 text-[11px] px-2 py-1 rounded-md border w-full h-6 whitespace-nowrap overflow-hidden text-ellipsis ${color}`}
                          title={label} // Show full text on hover
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
            ))}
          </div>
        </div>
      )}

      {/* Weekly view */}
      {calendarView === 'weekly' && (
        <div className="rounded-lg border border-white/10 overflow-hidden mt-4 h-[calc(100vh-120px)] flex flex-col">
          {/* Weekday headers */}
          <div className="flex bg-white/5">
            <div className="w-12 flex items-center justify-center py-2 border-r border-white/10">
              <span className="text-xs font-medium text-white/70">Giờ</span>
            </div>
            <div className="grid grid-cols-7 flex-1">
              {generateWeekDays().map((date, index) => ( // Use generateWeekDays here
                <div key={date.toDateString()} className="text-center text-xs font-medium text-white/70 py-2 border-r border-white/10 last:border-r-0">
                  {vietnameseWeekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]} {/* Correctly map day to Vietnamese weekday */}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly grid with time lines - show current week */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">
              {/* Time column - fixed 40px width, separate from grid */}
              <div className="w-12 pr-0 flex-shrink-0">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="h-20 flex items-end justify-end pr-1 pb-1">
                    <span className="text-xs text-white/60">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Days columns - 7 equal columns */}
              <div className="grid grid-cols-7 flex-1">
              {generateWeekDays().map((date, index) => { // Re-iterate generateWeekDays for content
                  const dayNum = date.getDate()
                  const month = date.getMonth()
                  const year = date.getFullYear()
                  const isCurrentMonth = month === currentMonth // This might not be accurate if week spans two months
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  // Get events for this day
                  const dayEvents = getCalendarEventsForDay(year, month, dayNum, calendarEvents)
                  
                  return (
                    <div
                      key={date.toDateString()} // Unique key for each day
                      className={`border-r border-white/10 ${index === 6 ? 'border-r-0' : ''}`}
                      onClick={() => {
                        setSelectedYear(year)
                        setSelectedMonth(month)
                        setSelectedDay(dayNum)
                        setClickedDays(new Set([`${year}-${month}-${dayNum}`]))
                        closePopup()
                      }}
                      onDragOver={handleCalendarDragOver}
                      onDrop={(e) => handleCalendarDrop(e, dayNum, year, month)}
                    >
                      {/* Day header */}
                      <div className="h-8 border-b border-white/5 flex items-center justify-center bg-white/5">
                        <div className="relative">
                          {isToday && (
                            <div className="absolute -top-1 -left-1 w-6 h-6 bg-[#E33265] rounded-full flex items-center justify-center">
                              <div className="text-xs text-white font-medium">{dayNum}</div>
                            </div>
                          )}
                          <div className={`text-xs font-medium ${isCurrentMonth ? 'text-white/90' : 'text-white/40'} ${isToday ? 'invisible' : ''}`}>
                            {dayNum}
                          </div>
                        </div>
                      </div>
                      
                      {/* Time slots */}
                      {Array.from({ length: 24 }, (_, hour) => {
                        // Find events for this specific hour
                        const hourEvents = dayEvents.filter(event => {
                          const timeParts = event.time?.split(':') // Use optional chaining
                          const eventHour = parseInt(timeParts?.[0] || '0')
                          return eventHour === hour
                        })
                        
                        return (
                          <div key={hour} className="h-20 border-b border-white/5 group hover:bg-white/5">
                            {/* Event indicators - stacked vertically */}
                            <div className="flex flex-col gap-1 p-1 h-full overflow-y-auto scrollbar-hide">
                              {hourEvents.map((event, eventIdx) => {
                                const label = getNoteText(event); // Use the new getNoteText helper
                                const color = event.noteType === 'green' 
                                  ? 'bg-[#8AE177]/20 border-[#8AE177]/40'
                                  : event.noteType === 'yellow' 
                                  ? 'bg-[#FACD5B]/20 border-[#FACD5B]/40'
                                  : event.noteType === 'red'
                                  ? 'bg-[#FF4F4F]/20 border-[#FF4F4F]/40'
                                  : 'bg-white/10 border-white/20'
                                
                                return (
                                  <button
                                    key={`${date.toDateString()}-${hour}-${eventIdx}`} // More robust key
                                    draggable={true} // Allow dragging all event notes
                                    onDragStart={(e) => handleCalendarNoteDragStart(e, dayNum, year, month, event)}
                                    onDragEnd={handleCalendarNoteDragEnd}
                                    onClick={(e) => handleNoteClick(e, event, date)}
                                    className={`h-6 rounded border flex items-center gap-1 px-2 ${color} hover:opacity-80 flex-shrink-0 whitespace-nowrap overflow-hidden text-ellipsis`}
                                    title={label}
                                    aria-label={`${label} event on ${event.platform}`}
                                  >
                                    <PlatformIcon platform={event.platform} size={12} variant="inline" />
                                    <span className="text-[10px] truncate" style={{ fontFamily: '"Fira Mono", monospace', fontWeight: 500 }}>
                                      {label}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Menu */}
      {showPopup && !showPopup.isEditingTime && (
        <div
          className="fixed z-50 bg-[#2A2A30] border border-white/10 rounded-md shadow-lg w-[140px] h-[55px] p-0 flex items-center justify-center gap-3"
          style={{
            left: `${showPopup.x}px`,
            top: `${showPopup.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {/* Edit time icon for yellow notes */}
          {showPopup.event.noteType === 'yellow' && (
            <div className="flex items-center justify-center h-full">
              <button onClick={handleEditTimeClick} aria-label="Edit post time" className="p-1 rounded hover:bg-white/10">
                <img src="/Clock.svg" alt="edit time" className="w-5 h-5 opacity-80" />
              </button>
            </div>
          )}
          
          {/* Header intentionally empty to avoid showing platform text/icon */}
          
          <div className="flex items-center justify-center h-full">
            <button onClick={() => handleOpenCreateFromCalendar(showPopup.event)} aria-label="Open post in editor" className="p-1 rounded hover:bg-white/10">
              <img src="/Eye.svg" alt="view" className="w-6 h-6 opacity-80" />
            </button>
          </div>


          {/* Trash icon for yellow notes */}
          {showPopup.event.noteType === 'yellow' && (
            <div className="flex items-center justify-center h-full">
              <button onClick={() => setShowDeleteConfirm(true)} aria-label="Delete calendar note" className="p-1 rounded hover:bg-white/10">
                <img src="/Trash.svg" alt="delete" className="w-5 h-5 opacity-80" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Time Edit Popup */}
      {showPopup && showPopup.isEditingTime && (
        <div 
          className="fixed z-50 bg-[#2A2A30] border border-white/10 rounded-lg shadow-lg p-4 flex flex-col gap-4"
          style={{
            left: `${showPopup.x}px`,
            top: `${showPopup.y}px`,
            transform: 'translate(-50%, -110%)'
          }}
        >
            <div className="flex items-center justify-center gap-2 text-white">
                <select value={editingHour} onChange={e => setEditingHour(parseInt(e.target.value))} className="bg-[#333] rounded p-1">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span>:</span>
                <select value={editingMinute} onChange={e => setEditingMinute(parseInt(e.target.value))} className="bg-[#333] rounded p-1">
                    {Array.from({ length: 60 }, (_, i) => i).map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                </select>
                <select value={editingAmPm} onChange={e => setEditingAmPm(e.target.value as 'AM' | 'PM')} className="bg-[#333] rounded p-1">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
            <div className="flex justify-center gap-2">
                <Button variant="ghost" size="sm" onClick={closePopup}>Hủy</Button>
                <Button variant="secondary" size="sm" onClick={handleSaveTimeEdit}>Lưu</Button>
            </div>
        </div>
      )}

      {/* Delete confirmation dialog (centered modal with dark backdrop) */}
      {showPopup && showDeleteConfirm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-[#2A2A30] border border-white/10 rounded-lg shadow-lg w-[300px] p-7 text-center">
              <div className="text-xl text-white font-semibold mb-8">Xác nhận xóa?</div>
              <div className="flex items-center justify-center gap-3">
                <button className="px-4 py-2 text-m rounded bg-white/10 text-white hover:bg-white/20 w-[100px] mr-2" onClick={() => setShowDeleteConfirm(false)}>Không</button>
                <button
                  className="px-4 py-2 text-m rounded bg-red-500/80 text-white hover:bg-red-500 w-[100px]"
                  onClick={handleDeleteEvent}
                >Xóa</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Backdrop to close popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-10"
          onClick={closePopup}
        />
      )}
    </div>
  )
}
