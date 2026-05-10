using System;
using API.Enums;
using API.Models;

namespace API.Entities;

public class User
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool isActive { get; set; } = true;
    public DateTime CreateAt { get; set; } = DateTime.UtcNow;

    // Email Verification
    public bool EmailConfirmed { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationTokenExpiry { get; set; }

    public string? PendingEmail { get; set; }
    public string? ChangeEmailToken { get; set; }
    public DateTime? ChangeEmailTokenExpiry { get; set; }

    // Password Reset
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    // Social Links (Instructor only)
    public string? GithubUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Major { get; set; }
    
    //Navigation properties
    public ICollection<Course> CoursesCreated { get; set; } = new List<Course>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

}
