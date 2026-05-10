using System;
using System.ComponentModel.DataAnnotations;
using API.Enums;

namespace API.Models;

public class RegisterDto
{
    [Required]
    public string FirstName { get; set; } = string.Empty;
    [Required]
    public string LastName { get; set; } = string.Empty;
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
    [RegularExpression( @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$", 
    ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Student;
}
