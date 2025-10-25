// DEBUGGING VERSION - components/create/modals/PublishModal.tsx

"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X as CloseIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from 'lucide-react';
import { useCreatePageStore, getCreatePageStore } from '@/store/createPageStore';
import { getDaysInMonth, vietnameseWeekdays } from '@/lib';

// Dữ liệu mock giữ nguyên
const platformOptions = [
    { name: "Twitter", icon: "/x.png" }, { name: "Instagram", icon: "/instagram.png" },
    { name: "LinkedIn", icon: "/link.svg" }, { name: "Facebook", icon: "/fb.svg" },
    { name: "Pinterest", icon: "/pinterest.svg" }, { name: "TikTok", icon: "/tiktok.png" },
    { name: "Threads", icon: "/threads.png" }, { name: "Bluesky", icon: "/bluesky.png" },
    { name: "YouTube", icon: "/ytube.png" }
];
const getAccountsForPlatform = (platform: string): Array<{ username: string; profilePic: string }> => {
    return [{ username: '@whatevername', profilePic: '/shego.jpg' }];
};

let renderCount = 0; // Biến đếm số lần render

export default function PublishModal() {
    renderCount++;
    // console.log(`%c[DEBUG] PublishModal RENDER #${renderCount}`, 'color: yellow;');

    const isOpen = useCreatePageStore(state => state.isPublishModalOpen);
    const selectedPostId = useCreatePageStore(state => state.selectedPostId);

    const setIsPublishModalOpen = useCreatePageStore(state => state.setIsPublishModalOpen);
    const schedulePost = useCreatePageStore(state => state.schedulePost);
    const handlePublish = useCreatePageStore(state => state.handlePublish);

    const closeModal = useCallback(() => {
        setIsPublishModalOpen(false);
    }, [setIsPublishModalOpen]);

    // State cục bộ
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [selectedAccountPic, setSelectedAccountPic] = useState('/shego.jpg');
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [publishTime, setPublishTime] = useState('now|Bây giờ');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [timeHour, setTimeHour] = useState('');
    const [timeMinute, setTimeMinute] = useState('');
    const [timeAmPm, setTimeAmPm] = useState<'AM' | 'PM'>('AM');

    const modalRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const accountDropdownRef = useRef<HTMLDivElement>(null);

    // useEffect chính để khởi tạo state
    useEffect(() => {
        // console.log('%c[DEBUG] MAIN useEffect RUNNING...', 'color: cyan; font-weight: bold;');
        
        if (isOpen) {
            // console.log('[DEBUG] Modal is open, initializing state...');
            const { openPosts } = getCreatePageStore();
            const currentPost = openPosts.find(p => p.id === selectedPostId);

            if (currentPost) {
                // console.log('[DEBUG] Found currentPost, setting platform:', currentPost.type);
                setSelectedPlatform(currentPost.type);
                
                const accounts = getAccountsForPlatform(currentPost.type);
                if (accounts.length > 0) {
                    setSelectedAccount(accounts[0].username);
                    setSelectedAccountPic(accounts[0].profilePic);
                }
            } else {
                // console.warn('[DEBUG] Could not find currentPost for id:', selectedPostId);
            }
            
            // Reset các state khác
            // console.log('[DEBUG] Resetting time and calendar states.');
            setPublishTime('now|Bây giờ');
            const now = new Date();
            setSelectedDate(now);
            setSelectedTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
            setTimeHour(String(now.getHours() % 12 || 12));
            setTimeMinute(String(now.getMinutes()).padStart(2, '0'));
            setTimeAmPm(now.getHours() >= 12 ? 'PM' : 'AM');
        } else {
            // console.log('[DEBUG] Modal is closed, resetting render count.');
            //renderCount = 0;  Reset khi modal đóng
        }
    }, [isOpen, selectedPostId]);


    // useEffect phụ (giữ nguyên)
    useEffect(() => {
        // console.log(`[DEBUG] Syncing showCalendar. publishTime is "${publishTime}"`);
        setShowCalendar(publishTime === 'pick a time');
    }, [publishTime]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (showCalendar && calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
            if (showAccountDropdown && accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) setShowAccountDropdown(false);
        };
        if (showCalendar || showAccountDropdown) document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showCalendar, showAccountDropdown]);

    if (!isOpen) {
        // Trả về null sẽ không log, nên log trước khi return
        // if (renderCount > 0) console.log('[DEBUG] Modal is NOT open. Rendering null.');
        return null;
    }

    // console.log('[DEBUG] Rendering modal content.');
    
    const handleConfirm = () => {
        if (publishTime === 'pick a time') {
            const combinedDateTime = new Date(selectedDate);
            const hour24 = timeAmPm === 'PM' && timeHour !== '12' 
                ? parseInt(timeHour, 10) + 12 
                : timeAmPm === 'AM' && timeHour === '12' 
                ? 0 
                : parseInt(timeHour, 10);
            combinedDateTime.setHours(hour24, parseInt(timeMinute, 10));
            schedulePost(selectedPostId, combinedDateTime, selectedTime);
        } else {
            handlePublish(selectedPostId);
        }
        closeModal();
    };

    const getMonthGrid = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
        const cells: Array<{ day: number | null }>[] = [];
        let row: Array<{ day: number | null }> = [];
        for (let i = 0; i < firstDay; i++) row.push({ day: null });
        for (let d = 1; d <= daysInMonth; d++) {
            row.push({ day: d });
            if (row.length === 7) { cells.push(row); row = []; }
        }
        if (row.length > 0) {
            while (row.length < 7) row.push({ day: null });
            cells.push(row);
        }
        return cells;
    };

    const handleConfirmPickTime = () => {
        const hh = parseInt(timeHour || '0', 10);
        const mm = parseInt(timeMinute || '0', 10);
        const hour12 = Math.min(12, Math.max(1, hh));
        const minute = Math.min(59, Math.max(0, mm));
        
        const newTime = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${timeAmPm}`;
        setSelectedTime(newTime);
        setShowCalendar(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
            <div ref={modalRef} className="bg-[#2A2A30] border border-[#3A3A42] rounded-lg p-7 w-[450px] max-w-[90vw] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] relative" onClick={e => e.stopPropagation()}>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-[#F5F5F7]">Xác nhận đăng</h3>
                    <p className="text-sm text-gray-400 mt-1">Chọn tài khoản và thời điểm đăng.</p>
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <img src={platformOptions.find(p => p.name === selectedPlatform)?.icon || '/placeholder.svg'} alt={selectedPlatform} className={`w-7 h-7 ${['Twitter','Threads'].includes(selectedPlatform) ? 'filter brightness-0 invert' : ''}`} />
                    <div className="flex-1 relative">
                        <div 
                            className={`flex items-center gap-3 bg-[#1E1E23] rounded-lg p-3 h-12 cursor-pointer transition-colors border border-[#3A3A42] ${showAccountDropdown ? 'ring-2 ring-[#E33265]' : ''}`}
                            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden"><img src={selectedAccountPic} alt="Profile" className="w-full h-full object-cover" /></div>
                            <div className="flex-1">
                                <div className="text-white text-sm">{selectedAccount || 'Chọn tài khoản'}</div>
                                <div className="text-xs text-white/50">{selectedPlatform}</div>
                            </div>
                            <ChevronDownIcon className="w-4 h-4 text-white/70" />
                        </div>
                        {showAccountDropdown && (
                            <div ref={accountDropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E23] rounded-lg border border-gray-700 shadow-lg z-10 max-h-48 overflow-y-auto">
                                {getAccountsForPlatform(selectedPlatform).map((account, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-700"
                                        onClick={() => {
                                            setSelectedAccount(account.username);
                                            setSelectedAccountPic(account.profilePic);
                                            setShowAccountDropdown(false);
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden"><img src={account.profilePic} alt="Profile" className="w-full h-full object-cover" /></div>
                                        <div className="flex-1"><div className="text-white text-sm">{account.username}</div></div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mb-4">
                    <p className="text-white mb-2">Khi nào bạn muốn đăng?</p>
                    <div className="relative rounded-lg bg-[#1E1E23] border border-[#3A3A42]">
                        <select 
                            value={publishTime} 
                            onChange={(e) => setPublishTime(e.target.value)}
                            className="w-full bg-[#1E1E23] text-white rounded-lg p-3 appearance-none pr-8 focus:outline-none"
                        >
                            <option value="now|Bây giờ">Bây giờ</option>
                            <option value="next free slot">Khe trống tiếp theo</option>
                            <option value="pick a time">Chọn thời gian</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                    </div>
                </div>
                {publishTime === 'pick a time' && (
                  <div className="mb-4">
                    <div className="text-white mb-2">Chọn thời gian</div>
                    <div 
                      className={`w-full bg-[#1E1E23] text-white rounded-lg p-3 cursor-pointer border border-[#3A3A42] ${showCalendar ? 'ring-2 ring-[#E33265]' : ''}`}
                      onClick={() => setShowCalendar(true)}
                    >
                      {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {selectedTime}
                    </div>
                  </div>
                )}
                {showCalendar && (
                    <div ref={calendarRef} className="absolute mt-2 bg-[#2A2A30] rounded-xl p-4 w-[360px] border border-[#3A3A42] shadow-lg z-20">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()))} className="p-1 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-5 h-5" /></button>
                            <h3 className="text-white font-semibold">{selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</h3>
                            <button onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()))} className="p-1 rounded-full hover:bg-white/10"><ChevronRightIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs text-white/70 mb-2">
                            {vietnameseWeekdays.map((w) => (<div key={w} className="py-1">{w}</div>))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {getMonthGrid(selectedDate).flat().map((cell, idx) => (
                                <button
                                    key={idx}
                                    disabled={!cell.day}
                                    onClick={() => { if (cell.day) setSelectedDate(d => new Date(d.getFullYear(), d.getMonth(), cell.day!)) }}
                                    className={`h-9 rounded-md text-sm ${!cell.day ? 'cursor-default' : 'hover:bg-white/10'} ${cell.day === selectedDate.getDate() ? 'bg-[#E33265]/20 text-white ring-1 ring-[#E33265]' : 'text-white/80'}`}
                                >
                                    {cell.day || ''}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex items-center bg-[#1E1E23] text-white rounded px-3 py-2 gap-2 border border-[#3A3A42]">
                                <input type="text" value={timeHour} onChange={(e) => setTimeHour(e.target.value.replace(/[^0-9]/g, ''))} className="w-8 bg-transparent text-center" placeholder="HH" />
                                <span>:</span>
                                <input type="text" value={timeMinute} onChange={(e) => setTimeMinute(e.target.value.replace(/[^0-9]/g, ''))} className="w-8 bg-transparent text-center" placeholder="MM" />
                                <select value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value as 'AM' | 'PM')} className="bg-transparent border-0 outline-none">
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                            <button className="bg-[#E33265] text-white p-2 rounded hover:bg-[#c52b57]" onClick={handleConfirmPickTime}>
                                <CheckCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1 border-[#E33265] text-white hover:bg-[#E33265]/10" onClick={closeModal}>Hủy</Button>
                    <Button className="flex-1 bg-[#E33265] hover:bg-[#c52b57] text-white" onClick={handleConfirm}>
                        {publishTime.startsWith('now') ? 'Đăng ngay' : 'Xác nhận lên lịch'}
                    </Button>
                </div>
            </div>
        </div>
    );
}