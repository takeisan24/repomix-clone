"use client";

import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import type { FailedPost } from "@/store/createPageStore";
import { formatTime } from '@/lib/utils/date';
import { useTranslations } from 'next-intl';

interface FailedPostItemProps {
    post: FailedPost;
    account: {username: string; profilePic: string};
    onRetry: (post: FailedPost) => void;
    maxWidth?: number; 
    // onDelete: (postId: number) => void;
}

export function FailedPostItem({ post, account, onRetry, maxWidth}: FailedPostItemProps) {
    const tCommon = useTranslations('Common');
    return (
    <div className="group rounded-xl transition-colors hover:bg-white/5">
      <div className="flex items-center px-4 py-3 w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PlatformIcon platform={post.platform} size={27} variant="inline" />
          <div className="text-white/90 truncate flex-1 min-w-0">
            {post.content}
          </div>
        </div>
        
        <div className="flex flex-col items-start text-white/80 flex-shrink-0 ml-4" style={{ width: `${maxWidth}px` }}>
          <div className="flex items-center gap-2 mb-1 w-full">
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
              <img src={account.profilePic} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-white/90">{account.username}</span>
          </div>
          <span className="text-xs whitespace-nowrap w-full">
            {post.date} <span className="opacity-70 ml-1">{formatTime(post.time)}</span>
          </span>
        </div>

        <div className="flex-shrink-0 ml-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRetry(post);
            }}
            className="w-24 h-9 bg-transparent border border-[#E33265] text-[#E33265] rounded-lg hover:bg-[#E33265] hover:text-white transition-all text-sm font-semibold"
          >
            {tCommon('retry')}
          </Button>
        </div>
      </div>
    </div>
    
  );
}