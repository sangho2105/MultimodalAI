using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultimodalAI_API.Data;
using MultimodalAI_API.Dtos;

namespace MultimodalAI_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InspectorsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InspectorsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/inspectors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InspectorReadDto>>> GetInspectors()
        {
            var inspectors = await _context.Inspectors
                .AsNoTracking()
                .Select(i => new InspectorReadDto
                {
                    InspectorId = i.InspectorId,
                    InspectorName = i.InspectorName,
                    Department = i.Department,
                    Email = i.Email
                })
                .ToListAsync();

            return Ok(inspectors);
        }

        // GET: api/inspectors/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<InspectorReadDto>> GetInspector(int id)
        {
            var inspector = await _context.Inspectors
                .AsNoTracking()
                .Where(i => i.InspectorId == id)
                .Select(i => new InspectorReadDto
                {
                    InspectorId = i.InspectorId,
                    InspectorName = i.InspectorName,
                    Department = i.Department,
                    Email = i.Email
                })
                .FirstOrDefaultAsync();

            if (inspector == null)
            {
                return NotFound(new { message = $"Không tìm thấy nhân viên kiểm định có mã {id}" });
            }

            return Ok(inspector);
        }
    }
}
