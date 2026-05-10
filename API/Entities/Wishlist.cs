using System;
using System.Runtime;

namespace API.Entities;

public class Wishlist
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CourseId { get; set; }

    public User? User { get; set; }
    public Course? Course { get; set; }
}
