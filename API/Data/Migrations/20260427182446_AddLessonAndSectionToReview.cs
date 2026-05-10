using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonAndSectionToReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LessonId",
                table: "Reviews",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SectionId",
                table: "Reviews",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_LessonId",
                table: "Reviews",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_SectionId",
                table: "Reviews",
                column: "SectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Lessons_LessonId",
                table: "Reviews",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Sections_SectionId",
                table: "Reviews",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Lessons_LessonId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Sections_SectionId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_LessonId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_SectionId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "LessonId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "SectionId",
                table: "Reviews");
        }
    }
}
