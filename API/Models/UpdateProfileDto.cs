using System;
using Microsoft.EntityFrameworkCore.Metadata;

namespace API.Models;

public class UpdateProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Major { get; set; }
}
