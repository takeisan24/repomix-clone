"use client";

import { useState, useCallback, useMemo } from "react";
import { useCreatePageStore } from "@/store/createPageStore";
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from "@/i18n/navigation";
import { CalendarEvent } from "@/lib/types/calendar";
import { getCalendarEventsForDay as getEventsFromStore } from "@/lib/utils/calendarUtils";
import {formatTimeTo12Hour} from "@/lib/utils/date";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

// Import các component con đã tạo
import { CalendarToolbar } from "./CalendarToolbar";
import { MonthlyViewGrid } from "./MonthlyViewGrid";
import { WeeklyViewGrid } from "./WeeklyViewGrid";
import { CalendarPopups } from "./CalendarPopups";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

// Định nghĩa kiểu cho state của modal xóa
type DeleteModalState = { event: CalendarEvent; date: Date } | null;

export default function CalendarSection() {
    const router = useRouter();
    const t = useTranslations('CreatePage.calendarSection');
    const tToast = useTranslations('Common.toast');

    // Helper function with translation support
    const getNoteText = (event: CalendarEvent): string => {
        const formattedTime = formatTimeTo12Hour(event.time);
        switch (event.noteType) {
            case 'green': return `${t('eventStatus.published')} ${formattedTime}`.trim();
            case 'yellow':
                const hasContentOrTime = !!(event.content || event.time);
                if (!hasContentOrTime) return t('eventStatus.empty');
                return `${t('eventStatus.scheduled')} ${formattedTime}`.trim();
            case 'red': return `${t('eventStatus.failed')} ${formattedTime}`.trim();
            default: return `${event.platform} ${formattedTime}`.trim();
        }
    };
    
    // Lấy các action cần thiết từ Zustand store
    const { calendarEvents, addEvent, updateEvent, deleteEvent, openPostFromUrl, setActiveSection } = useCreatePageStore(
        useShallow((state) => ({
            calendarEvents: state.calendarEvents,
            addEvent: state.handleEventAdd,
            updateEvent: state.handleEventUpdate,
            deleteEvent: state.handleEventDelete,
            openPostFromUrl: state.openPostFromUrl,
            setActiveSection: state.setActiveSection,
        }))
    );

    // --- STATE MANAGEMENT ---
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [calendarView, setCalendarView] = useState<'monthly' | 'weekly'>("monthly");
    const [clickedDays, setClickedDays] = useState<Set<string>>(new Set());
    
    // State cho popup chính và modal xác nhận xóa
    const [popup, setPopup] = useState<{ x: number; y: number; event: CalendarEvent; date: Date } | null>(null);
    const [eventToDelete, setEventToDelete] = useState<DeleteModalState>(null);

    const getMondayOfCurrentWeek = useCallback(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + daysToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    }, []);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMondayOfCurrentWeek());

    // --- EVENT HANDLERS (Logic từ file backup) ---

    // Điều hướng lịch
    const goPrev = () => {
    if (calendarView === 'monthly') {
        setCurrentMonth(prev => {
            if (prev === 0) {
                setCurrentYear(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
    } else {
        // --- SỬA LỖI Ở ĐÂY ---
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev); // 1. Tạo bản sao
            newDate.setDate(prev.getDate() - 7); // 2. Thay đổi trên bản sao
            return newDate; // 3. Trả về bản sao
        });
    }
};
    const goNext = () => {
    if (calendarView === 'monthly') {
        setCurrentMonth(prev => {
            if (prev === 11) {
                setCurrentYear(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
    } else {
        // --- SỬA LỖI Ở ĐÂY ---
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev); // 1. Tạo bản sao
            newDate.setDate(prev.getDate() + 7); // 2. Thay đổi trên bản sao
            return newDate; // 3. Trả về bản sao
        });
    }
};

    // Xử lý kéo/thả
    const handleIconDragStart = (e: React.DragEvent, platform: string) => e.dataTransfer.setData('application/json', JSON.stringify({ platform }));
    const handleNoteDragStart = (e: React.DragEvent, date: Date, event: CalendarEvent) => e.dataTransfer.setData('application/json', JSON.stringify({ event, oldDate: date.toISOString() }));
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/json') ? 'move' : 'copy'; };

    const handleDrop = (e: React.DragEvent, date: Date, time?: string) => {
        e.preventDefault();
        setPopup(null);
        try {
            const now = new Date();
            const targetDateTime = new Date(date);

            if (time) {
                // Nếu có time cụ thể, set chính xác giờ:phút
                const [hour, minute] = time.split(':').map(Number);
                targetDateTime.setHours(hour, minute, 0, 0);
            } else {
                // Nếu không có time (kéo vào ô ngày trong monthly view):
                // - Nếu là ngày hôm nay: set giờ hiện tại + 1 giờ
                // - Nếu là ngày tương lai: set 9:00 AM
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const targetDay = new Date(date);
                targetDay.setHours(0, 0, 0, 0);
                
                if (targetDay.getTime() === today.getTime()) {
                    // Ngày hôm nay: set giờ hiện tại + 1 giờ
                    targetDateTime.setHours(now.getHours() + 1, 0, 0, 0);
                } else {
                    // Ngày tương lai: set 9:00 AM
                    targetDateTime.setHours(9, 0, 0, 0);
                }
            }

            // Kiểm tra nếu thời gian đích < thời gian hiện tại
            if (targetDateTime.getTime() < now.getTime()){
                toast.error(tToast('pastTimeError'));
                return;
            }

            const data = JSON.parse(e.dataTransfer.getData('application/json')); 

            if (data.platform) { // Kéo từ icon
                // Format time as HH:MM for storage
                const formattedTime = time || `${String(targetDateTime.getHours()).padStart(2, '0')}:${String(targetDateTime.getMinutes()).padStart(2, '0')}`;
                addEvent(date.getFullYear(), date.getMonth(), date.getDate(), data.platform, formattedTime);
                toast.success(tToast('eventAdded', { platform: data.platform }));
            } else if (data.event && data.oldDate) { // Kéo từ một event đã có
                const oldDate = new Date(data.oldDate);
                const newTime = time || `${String(targetDateTime.getHours()).padStart(2, '0')}:${String(targetDateTime.getMinutes()).padStart(2, '0')}`;
                updateEvent(
                    oldDate.getFullYear(), oldDate.getMonth(), oldDate.getDate(), data.event,
                    date.getFullYear(), date.getMonth(), date.getDate(), newTime 
                );
                toast.info(tToast('eventMoved'));
            }
        } catch (err) { console.error("Drop failed:", err); toast.error(tToast('dropFailed')); }
    };

    // Xử lý click trên popup
    const handleNoteClick = (e: React.MouseEvent, event: CalendarEvent, date: Date) => { e.stopPropagation(); setPopup({ x: e.clientX, y: e.clientY, event, date }); };

    const handleOpenInEditor = (event: CalendarEvent, date: Date) => {
        if (event.noteType === 'green' && event.url) {
            window.open(event.url, '_blank');
        } else {
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            setActiveSection('create');
            openPostFromUrl(event.platform, event.content || '', { eventId: event.id, dateKey });
        }
        setPopup(null);
    };

    const handleSaveTime = (event: CalendarEvent, date: Date, newTime24h: string) => {
        updateEvent(
            date.getFullYear(), date.getMonth(), date.getDate(), event,
            date.getFullYear(), date.getMonth(), date.getDate(), newTime24h
        );
        toast.success(tToast('timeUpdated'));
    };

    const handleDeleteConfirm = () => {
        if (!eventToDelete) return;
        const { event, date } = eventToDelete;
        deleteEvent(date.getFullYear(), date.getMonth(), date.getDate(), event);
        toast.success(tToast('eventDeleted'));
        setEventToDelete(null);
    };

    // --- DATA GENERATION (Sử dụng useMemo để tối ưu) ---
    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
        const gridDays = [];
        let currentDay = new Date(currentYear, currentMonth, 1);
        currentDay.setDate(currentDay.getDate() - firstDayIndex);

        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(currentDay);
            const dayNum = cellDate.getDate();
            const inCurrentMonth = cellDate.getMonth() === currentMonth;
            const isToday = new Date().toDateString() === cellDate.toDateString();
            const clickedKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${dayNum}`;
            const dayEvents = getEventsFromStore(cellDate.getFullYear(), cellDate.getMonth(), dayNum, calendarEvents);

            gridDays.push({ dayNum, inCurrentMonth, isToday, clickedKey, dayEvents, cellDate, isClicked: clickedDays.has(clickedKey) });
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return gridDays;
    }, [currentYear, currentMonth, calendarEvents, clickedDays]);

    const weekDays = useMemo(() => {
        const startOfWeek = new Date(currentWeekStart);
        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    }, [currentWeekStart]);

    const eventsForWeek = useMemo(() => {
        const events: Record<string, CalendarEvent[]> = {};
        const days = weekDays; // weekDays đã được tính toán bằng useMemo ở trên
        
        days.forEach(date => {
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const dayEvents = getEventsFromStore(date.getFullYear(), date.getMonth(), date.getDate(), calendarEvents);
            if (dayEvents.length > 0) {
                events[dateKey] = dayEvents.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
            }
        });
        return events;
    }, [weekDays, calendarEvents]);

    // --- RENDER COMPONENT ---
    return (
        <div className="w-full max-w-none mx-4 mt-[30px] flex flex-col h-[calc(100vh-80px)]">
            <CalendarToolbar
                calendarView={calendarView}
                currentMonth={currentMonth}
                currentYear={currentYear}
                currentWeekStart={currentWeekStart}
                onPrev={goPrev}
                onNext={goNext}
                onSetView={setCalendarView}
                onIconDragStart={handleIconDragStart}
            />

            <div className="flex-1 min-h-0">
                {calendarView === 'monthly' ? (
                    <MonthlyViewGrid
                        calendarGrid={calendarGrid}
                        getNoteText={getNoteText}
                        onDayClick={(cell) => { setClickedDays(new Set([cell.clickedKey])); setPopup(null); }}
                        onDragOver={handleDragOver}
                        onDrop={(e, cell) => handleDrop(e, cell.cellDate, undefined)}
                        onNoteDragStart={(e, cell, event) => handleNoteDragStart(e, cell.cellDate, event)}
                        onNoteClick={handleNoteClick}
                    />
                ) : (
                    <WeeklyViewGrid
                        weekDays={weekDays}
                        eventsByDay={eventsForWeek}
                        getNoteText={getNoteText}
                        onDayClick={(date) => { setClickedDays(new Set([`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`])); setPopup(null); }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onNoteDragStart={handleNoteDragStart}
                        onNoteClick={handleNoteClick}
                    />
                )}
            </div>

            <CalendarPopups
                popupData={popup}
                onClose={() => setPopup(null)}
                onOpenInEditor={handleOpenInEditor}
                onConfirmDelete={(event, date) => { setEventToDelete({ event, date }); setPopup(null); }}
                onSaveTime={handleSaveTime}
            />
            
            {eventToDelete && (
                <ConfirmDeleteModal
                    onClose={() => setEventToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
}