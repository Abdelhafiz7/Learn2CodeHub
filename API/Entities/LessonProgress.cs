using System;

namespace API.Entities;

public class LessonProgress
{
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;

        public bool IsCompleted { get; set; } = false;

        public double WatchedPercentage { get; set; } = 0;

        public DateTime? LastViewedAt { get; set; }
    }

