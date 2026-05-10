using System;

namespace API.Entities;

public class Lesson
{
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? VideoUrl { get; set; }
        public string? FileUrl { get; set; }
        public int DurationInMinutes { get; set; }
        public bool IsPreview { get; set; } = false;
        public int Order { get; set; }
        public int SectionId { get; set; }

        public Section Section { get; set; } = null!;
        public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    }
