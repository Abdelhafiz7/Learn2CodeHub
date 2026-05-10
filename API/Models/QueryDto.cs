using System;
using API.Enums;

namespace API.Models;

public class QueryDto
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public CourseLevel? Level {get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
