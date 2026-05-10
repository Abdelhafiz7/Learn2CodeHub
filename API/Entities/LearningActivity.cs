using System;

namespace API.Entities;

public class LearningActivity
{
    public int Id { get; set; }
    public int UserId { get; set; }    
    public DateTime Date { get; set; }
    public User? User { get; set; } 
}  
