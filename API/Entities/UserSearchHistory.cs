using System;

namespace API.Entities;

public class UserSearchHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string SearchTerm  { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    public DateTime SearchedAt { get; set; } = DateTime.UtcNow;
}
