using System;

namespace API.Models;

public class LessonProgressDto
{

        public int LessonId { get; set; }

        public bool IsCompleted { get; set; } = false;

        public double WatchedPercentage { get; set; } = 0;

        public DateTime? LastViewedAt { get; set; }
    }
