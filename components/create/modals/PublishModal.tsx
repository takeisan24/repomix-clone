"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X as CloseIcon} from 'lucide-react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from 'lucide-react';
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

import { getDaysInMonth, vietnameseWeekdays } from '@/lib';

const platformOptions = [
    { name: "Twitter", icon: "/x.png" }, { name: "Instagram", icon: "/instagram.png" },
    { name: "LinkedIn", icon: "/link.svg" }, { name: "Facebook", icon: "/fb.svg" },
    { name: "Pinterest", icon: "/pinterest.svg" }, { name: "TikTok", icon: "/tiktok.png" },
    { name: "Threads", icon: "/threads.png" }, { name: "Bluesky", icon: "/bluesky.png" },
    { name: "YouTube", icon: "/ytube.png" }
]

const getAccountsForPlatform = (platform: string): Array<{ username: string; profilePic: string }> => {
    return [{ username: '@whatevername', profilePic: '/shego.jpg' }]; // Mock data
};

export default function PublishModal() {
  // Lấy state và actions cần thiết từ store
    const {
        isOpen, closeModal, selectedPostId, openPosts,
        postContents, handlePublish, handlePostDelete , schedulePost // `schedulePost` sẽ là action mới
    } = useCreatePageStore(useShallow(state => ({
        isOpen: state.isPublishModalOpen,
        closeModal: () => state.setIsPublishModalOpen(false),
        selectedPostId: state.selectedPostId,
        openPosts: state.openPosts,
        postContents: state.postContents,
        handlePublish: state.handlePublish,
        schedulePost: state.schedulePost, // <-- Action mới để lên lịch
        handlePostDelete: state.handlePostDelete
    })));

    const currentPost = openPosts.find(p => p.id === selectedPostId);

    // State cục bộ chỉ dành cho UI của modal này
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [selectedAccountPic, setSelectedAccountPic] = useState('/shego.jpg');
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [publishTime, setPublishTime] = useState('now|Bây giờ');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    const [timeHour, setTimeHour] = useState('');
    const [timeMinute, setTimeMinute] = useState('');
    const [timeAmPm, setTimeAmPm] = useState<'AM'|'PM'>('AM');

    const modalRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const accountDropdownRef = useRef<HTMLDivElement>(null)

    // Logic để khởi tạo modal khi mở
    // useEffect(() => {
    //     if (isOpen && currentPost) {
    //         setSelectedPlatform(currentPost.type);
    //         const accounts = getAccountsForPlatform(currentPost.type);
    //         if (accounts.length > 0) {
    //             setSelectedAccount(accounts[0].username);
    //             setSelectedAccountPic(accounts[0].profilePic);
    //         }
    //         // Reset về trạng thái mặc định mỗi khi mở
    //         setPublishTime('now|Bây giờ');
    //         setShowCalendar(false);
    //         setSelectedDate(new Date());
    //     }
    // }, [isOpen, currentPost]);

    // Logic đóng calendar khi click ra ngoài
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) setShowAccountDropdown(false);
        };
        if (showCalendar || showAccountDropdown) document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showCalendar, showAccountDropdown]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (publishTime === 'pick a time') {
            //Gọi action lên lịch từ store
            schedulePost(selectedPostId, selectedDate, selectedTime);
            console.log("Scheduling post...");
        } else {
            handlePublish(selectedPostId);
        }
        closeModal();
    };

    const getMonthGrid = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const daysInMonth = getDaysInMonth(year, month)
      const firstDay = new Date(year, month, 1).getDay() // 0=Sun
      // Convert to Monday-first index (Mon=0 ... Sun=6) matching our header
      const firstIdx = (firstDay + 6) % 7
      const cells: Array<{ day: number | null }>[] = []
      let row: Array<{ day: number | null }> = []
      for (let i = 0; i < firstIdx; i++) row.push({ day: null })
      for (let d = 1; d <= daysInMonth; d++) {
        row.push({ day: d })
        if (row.length === 7) { cells.push(row); row = [] }
      }
      if (row.length) {
        while (row.length < 7) row.push({ day: null })
        cells.push(row)
      }
      return cells
    }
    const handleConfirmPickTime = () => {
      const hh = String(Math.min(12, Math.max(0, parseInt(timeHour || '0', 10))).toString().padStart(2, '0'))
      const mm = String(Math.min(59, Math.max(0, parseInt(timeMinute || '0', 10))).toString().padStart(2, '0'))
      setSelectedTime(`${hh}:${mm} ${timeAmPm}`)
      setShowCalendar(false)
    };

  return(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div ref={modalRef} className="bg-[#2A2A30] border border-[#3A3A42] rounded-lg p-7 w-[450px] max-w-[90vw] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] relative">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#F5F5F7]">Xác nhận đăng</h3>
              <p className="text-sm text-gray-400 mt-1">Chọn tài khoản và thời điểm đăng.</p>
            </div>

            {/* Account & Platform */}
            <div className="flex items-center gap-3 mb-4">
              {/* Platform icon */}
              <img src={platformOptions.find(p => p.name === selectedPlatform)?.icon || '/placeholder.svg'} alt={selectedPlatform} className={`w-7 h-7 ${['Twitter','Threads'].includes(selectedPlatform) ? 'filter brightness-0 invert' : ''}`} />
              <div className="flex-1 relative">
                <div 
                  className={`flex items-center gap-3 bg-[#1E1E23] rounded-lg p-3 h-12 cursor-pointer transition-colors border border-[#3A3A42] ${showAccountDropdown ? 'ring-2 ring-[#E33265]' : ''}`}
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={selectedAccountPic} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{selectedAccount || 'Chọn tài khoản'}</div>
                    <div className="text-xs text-white/50">{selectedPlatform}</div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-white/70" />
                </div>

                {/* Account Dropdown */}
                {showAccountDropdown && (
                  <div ref={accountDropdownRef} data-account-dropdown className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E23] rounded-lg border border-gray-700 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] z-10 max-h-48 overflow-y-auto">
                    {getAccountsForPlatform(selectedPlatform).map((account, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAccount(account.username)
                          setSelectedAccountPic(account.profilePic)
                          setShowAccountDropdown(false)
                        }}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img src={account.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm">{account.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="mb-4">
              <p className="text-white mb-2">Khi nào bạn muốn đăng?</p>
              <div ref={calendarRef} className={`relative rounded-lg bg-[#1E1E23] border border-[#3A3A42]`}>
                <select 
                  value={publishTime} 
                  onChange={(e) => {
                    setPublishTime(e.target.value)
                    setShowCalendar(e.target.value === 'pick a time')
                  }}
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
                  role="button"
                  aria-label="Chọn thời gian"
                >
                  {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {selectedTime}
                </div>
              </div>
            )}

            {/* Calendar Popup */}
            {showCalendar && publishTime === 'pick a time' && (
              <div
                ref={calendarRef}
                className="absolute mt-2 bg-[#2A2A30] rounded-xl p-4 w-[360px] border border-[#3A3A42] shadow-lg z-20"
                tabIndex={0}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { const d=new Date(selectedDate); d.setMonth(d.getMonth()-1); setSelectedDate(d) }} className="text-white hover:text-gray-300"><ChevronLeftIcon className="w-5 h-5" /></button>
                  <h3 className="text-white font-semibold">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={() => { const d=new Date(selectedDate); d.setMonth(d.getMonth()+1); setSelectedDate(d) }} className="text-white hover:text-gray-300"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center text-xs text-white/70 mb-2">
                  {vietnameseWeekdays.map((w) => (<div key={w} className="py-1">{w}</div>))}
                </div>
                {/* Month grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthGrid(selectedDate).flat().map((cell, idx) => {
                    const isSelected = cell.day === selectedDate.getDate()
                    return (
                      <button
                        key={idx}
                        disabled={!cell.day}
                        onClick={() => {
                          if (!cell.day) return
                          const d = new Date(selectedDate)
                          d.setDate(cell.day)
                          setSelectedDate(d)
                        }}
                        className={`h-9 rounded-md text-sm ${!cell.day ? 'opacity-30 cursor-default' : 'hover:bg-white/10'} ${isSelected ? 'bg-[#E33265]/20 text-white ring-1 ring-[#E33265]' : 'text-white/80'}`}
                      >
                        {cell.day || ''}
                      </button>
                    )
                  })}
                </div>
                {/* Time Input */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center bg-[#1E1E23] text-white rounded px-3 py-2 gap-2 border border-[#3A3A42]">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={timeHour}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '').slice(0,2)
                        setTimeHour(v)
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmPickTime() }}
                      className="w-8 bg-transparent text-center"
                      placeholder="– –"
                      aria-label="Giờ"
                    />
                    <span>:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={timeMinute}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '').slice(0,2)
                        setTimeMinute(v)
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmPickTime() }}
                      className="w-8 bg-transparent text-center"
                      placeholder="– –"
                      aria-label="Phút"
                    />
                    <select
                      value={timeAmPm}
                      onChange={(e) => setTimeAmPm(e.target.value as 'AM'|'PM')}
                      className="bg-transparent"
                      aria-label="AM/PM"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                  <button className="bg-[#E33265] text-white p-2 rounded active:bg-[#c52b57]" onClick={handleConfirmPickTime}>
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1 border-[#E33265] text-white hover:bg-[#E33265]/10"
                onClick={closeModal}
              >
                Hủy
              </Button>
              <Button 
                className="flex-1 bg-[#E33265] hover:bg-[#c52b57] text-white opacity-50"
                onClick={handleConfirm}
              >
                {publishTime.startsWith('now') ? 'Đăng ngay' : 'Xác nhận lên lịch'}
              </Button>
            </div>
          </div>
        </div>
      )
}





