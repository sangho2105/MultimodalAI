using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultimodalAI_API.Data;
using MultimodalAI_API.Dtos;

namespace MultimodalAI_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductReadDto>>> GetProducts()
        {
            var products = await _context.Products
                .AsNoTracking()
                .Select(p => new ProductReadDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    Category = p.Category,
                    TotalStock = p.TotalStock,
                    PassedStock = p.PassedStock,
                    FailedStock = p.FailedStock,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductReadDto>> GetProduct(int id)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Where(p => p.ProductId == id)
                .Select(p => new ProductReadDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    Category = p.Category,
                    TotalStock = p.TotalStock,
                    PassedStock = p.PassedStock,
                    FailedStock = p.FailedStock,
                    CreatedAt = p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có mã {id}" });
            }

            return Ok(product);
        }
    }
}
