using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProgressToEnrollment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastAccessedAt",
                table: "Enrollments",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LastLessonId",
                table: "Enrollments",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Progress",
                table: "Enrollments",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_LastLessonId",
                table: "Enrollments",
                column: "LastLessonId");

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Lessons_LastLessonId",
                table: "Enrollments",
                column: "LastLessonId",
                principalTable: "Lessons",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Lessons_LastLessonId",
                table: "Enrollments");

            migrationBuilder.DropIndex(
                name: "IX_Enrollments_LastLessonId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "LastAccessedAt",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "LastLessonId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "Progress",
                table: "Enrollments");
        }
    }
}
