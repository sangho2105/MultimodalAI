using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultimodalAI_API.Data;
using MultimodalAI_API.Dtos;

namespace MultimodalAI_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DefectCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DefectCategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/defectcategories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DefectCategoryReadDto>>> GetDefectCategories()
        {
            var categories = await _context.DefectCategories
                .AsNoTracking()
                .Select(d => new DefectCategoryReadDto
                {
                    DefectCategoryId = d.DefectCategoryId,
                    CategoryName = d.CategoryName,
                    SeverityLevel = d.SeverityLevel,
                    Description = d.Description
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/defectcategories/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<DefectCategoryReadDto>> GetDefectCategory(int id)
        {
            var category = await _context.DefectCategories
                .AsNoTracking()
                .Where(d => d.DefectCategoryId == id)
                .Select(d => new DefectCategoryReadDto
                {
                    DefectCategoryId = d.DefectCategoryId,
                    CategoryName = d.CategoryName,
                    SeverityLevel = d.SeverityLevel,
                    Description = d.Description
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound(new { message = $"Không tìm thấy danh mục lỗi có mã {id}" });
            }

            return Ok(category);
        }
    }
}
