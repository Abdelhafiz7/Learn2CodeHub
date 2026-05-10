import React from 'react';
import { useApi } from '@/hooks';
import { dashboardApi } from '@/api/dashboard';
import { Star, MessageSquare, Send, Reply, Award, CheckCircle, PlayCircle, Layers } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import toast from 'react-hot-toast';

export const InstructorReviews = () => {
  const { data: reviews, isLoading } = useApi(
    () => dashboardApi.getLatestReviews(),
    []
  );

  const [replyText, setReplyText] = React.useState<{ [key: number]: string }>({});
  const [activeReply, setActiveReply] = React.useState<number | null>(null);
  const [localReviews, setLocalReviews] = React.useState<any[]>([]);

  const handleReplyChange = (reviewId: number, value: string) => {
    setReplyText(prev => ({ ...prev, [reviewId]: value }));
  };

  const handleSendReply = async (reviewId: number) => {
    const reply = replyText[reviewId];

    if (!reply || reply.trim() === '') {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      await dashboardApi.replyToReview(reviewId, reply);
      toast.success('Reply sent successfully!');
      
      setLocalReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? { ...r, instructorReply: reply }
            : r
        )
      );

      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      setActiveReply(null);
    } catch {
      toast.error('Failed to send reply');
    }
  };

  React.useEffect(() => {
    if (reviews) {
      setLocalReviews(reviews);
    }
  }, [reviews]);

  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-12 w-full">
      
      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 border border-indigo-400/20 shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 transform-gpu"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-white/20 rounded-2xl shadow-lg border border-white/10 backdrop-blur-sm">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Student Reviews</h1>
            <p className="text-indigo-100 font-medium mt-1">Read and respond to feedback from your students</p>
          </div>
        </div>
      </div>

      {localReviews.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center shadow-lg">
           <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">No reviews yet</h3>
           <p className="text-gray-500 dark:text-gray-400 mt-2">When students review your courses, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {localReviews.map((review: any) => (
            <div key={review.id} className="relative overflow-hidden bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform-gpu group">
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* AVATAR & RATING COLUMN */}
                <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:w-48 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                      {getInitials(review.studentName)}
                    </div>
                    <div className="md:hidden">
                      <p className="font-bold text-gray-900 dark:text-white">{review.studentName}</p>
                      <div className="flex text-amber-400 gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'opacity-20'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{review.studentName}</p>
                    <div className="flex text-amber-400 gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'opacity-20'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* REVIEW CONTENT COLUMN */}
                <div className="flex-1 min-w-0">
                  {/* Context Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      {review.courseThumbnail ? (
                        <img src={review.courseThumbnail} alt="" className="w-7 h-7 rounded-md object-cover" />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                      <span className="truncate max-w-[200px] sm:max-w-xs">{review.courseTitle}</span>
                    </div>
                    {review.sectionTitle && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{review.sectionTitle}</span>
                      </div>
                    )}
                    {review.lessonTitle && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-lg">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{review.lessonTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 dark:text-gray-300 text-lg italic leading-relaxed mb-6">
                    "{review.comment}"
                  </p>

                  {/* INSTRUCTOR REPLY BUBBLE */}
                  {review.instructorReply && (
                    <div className="ml-4 md:ml-8 relative">
                      {/* Curved line connector */}
                      <div className="absolute -left-6 top-6 w-4 h-full border-l-2 border-b-2 border-indigo-200 dark:border-indigo-500/30 rounded-bl-xl"></div>
                      
                      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl rounded-tl-sm p-5 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Your Reply</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {review.instructorReply}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* REPLY INPUT AREA */}
                  {!review.instructorReply && (
                    <div className="mt-4">
                      {activeReply === review.id ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50 dark:bg-[#13151A] rounded-2xl p-2 border border-indigo-200 dark:border-indigo-500/30 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                          <textarea
                            value={replyText[review.id] || ''}
                            onChange={(e) => handleReplyChange(review.id, e.target.value)}
                            placeholder="Write a thoughtful reply to your student..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 p-3 min-h-[100px] resize-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 p-2 border-t border-gray-200 dark:border-gray-800">
                            <button
                              onClick={() => {
                                setActiveReply(null);
                                setReplyText(prev => ({ ...prev, [review.id]: '' }));
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSendReply(review.id)}
                              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                              <Send className="w-4 h-4" /> Send Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveReply(review.id)}
                          className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group/btn"
                        >
                          <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 group-hover/btn:bg-indigo-100 dark:group-hover/btn:bg-indigo-500/20 transition-colors">
                            <Reply className="w-4 h-4" />
                          </div>
                          Reply to student
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};