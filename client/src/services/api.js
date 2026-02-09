import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: '/api', // Relative path to be proxied or intercepted
  timeout: 5000,
});

// Mock Data
const MOCK_CONFIG = {
  dollarRate: 1250.00,
  profitMargin: 30, // Percentage
  profitRules: [], // Rules for conditional profit margins
  lastUpdated: new Date().toISOString(),
};

const MOCK_PRODUCTS = [];
// Products will be populated via bulk import or manual add

// Mock Interceptor
// Set to true to enable mocking
const USE_MOCKS = true;

if (USE_MOCKS) {
  api.interceptors.request.use(async (config) => {
    console.log(`[Mock API] ${config.method.toUpperCase()} ${config.url}`, config.data || '');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Throw error to be caught by response interceptor (simulating adapter)
    // Or just return a custom object that the adapter handles?
    // Axios adapters are complex.
    // Easier way: use adapter config.
    config.adapter = async (config) => {
      const { url, method, data } = config;

      // GET /public/config
      if (method === 'get' && url.includes('/public/config')) {
        return {
          data: MOCK_CONFIG,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // GET /public/products
      if (method === 'get' && url.includes('/public/products')) {
        return {
          data: MOCK_PRODUCTS,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // POST /admin/import
      if (method === 'post' && url.includes('/admin/import')) {
        const parsedData = JSON.parse(data);
        const rawText = parsedData.data || '';
        const lines = rawText.split('\n').filter(line => line.trim());
        const importedProducts = [];
        let currentCategory = 'Sin categoría';

        // Regex patterns
        const categoryPattern = /^►\s*(.+?)(?:\s*-\s*GTIA.*)?$/i;
        const productPattern = /^▪️(.+?)\s*-\s*\$\s*([\d,.]+)/;

        lines.forEach(line => {
          const trimmedLine = line.trim();

          // Check if it's a category line (starts with ►)
          const categoryMatch = trimmedLine.match(categoryPattern);
          if (categoryMatch) {
            currentCategory = categoryMatch[1].trim();
            return; // Skip to next line
          }

          // Check if it's a product line (starts with ▪️)
          const productMatch = trimmedLine.match(productPattern);
          if (productMatch) {
            const name = productMatch[1].trim();
            const priceStr = productMatch[2].replace(',', '.');
            const priceUsd = parseFloat(priceStr) || 0;

            const newProduct = {
              id: MOCK_PRODUCTS.length + importedProducts.length + 1,
              name,
              priceUsd,
              category: currentCategory
            };
            importedProducts.push(newProduct);
            return;
          }

          // Fallback: Try old CSV format (name, price, category)
          const parts = trimmedLine.split(',').map(p => p.trim());
          if (parts.length >= 2 && !trimmedLine.startsWith('►') && !trimmedLine.startsWith('▪️')) {
            const name = parts[0];
            const priceUsd = parseFloat(parts[1]) || 0;
            const category = parts[2] || 'Sin categoría';
            const newProduct = {
              id: MOCK_PRODUCTS.length + importedProducts.length + 1,
              name,
              priceUsd,
              category
            };
            importedProducts.push(newProduct);
          }
        });

        // Agregar los productos importados al array principal
        MOCK_PRODUCTS.push(...importedProducts);

        return {
          data: {
            success: true,
            message: `${importedProducts.length} productos importados correctamente`,
            products: importedProducts
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // POST /admin/product (Manual Add)
      if (method === 'post' && url.includes('/admin/product')) {
        const newProduct = JSON.parse(data);
        MOCK_PRODUCTS.push({ ...newProduct, id: MOCK_PRODUCTS.length + 1 });
        return {
          data: { success: true, message: 'Producto agregado' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }

      // DELETE /admin/product/:id (Delete Single Product)
      if (method === 'delete' && url.match(/\/admin\/product\/\d+$/)) {
        const productId = parseInt(url.split('/').pop());
        const index = MOCK_PRODUCTS.findIndex(p => p.id === productId);
        if (index !== -1) {
          MOCK_PRODUCTS.splice(index, 1);
          return {
            data: { success: true, message: 'Producto eliminado' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          }
        }
        return {
          data: { success: false, message: 'Producto no encontrado' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config
        }
      }

      // DELETE /admin/products (Delete All)
      if (method === 'delete' && url.includes('/admin/products')) {
        const count = MOCK_PRODUCTS.length;
        MOCK_PRODUCTS.length = 0; // Clear array
        return {
          data: { success: true, message: `${count} productos eliminados`, count },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }

      // POST /admin/config
      if (method === 'post' && url.includes('/admin/config')) {
        const newConfig = JSON.parse(data);
        if (newConfig.profitMargin !== undefined) MOCK_CONFIG.profitMargin = newConfig.profitMargin;
        if (newConfig.profitRules !== undefined) MOCK_CONFIG.profitRules = newConfig.profitRules;
        MOCK_CONFIG.lastUpdated = new Date().toISOString();
        return {
          data: { success: true, message: 'Configuración actualizada' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }

      // Login (Mock)
      if (method === 'post' && url.includes('/auth/login')) {
        return {
          data: { token: 'mock-token-123' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }

      return {
        data: null,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      };
    };

    return config;
  });
}

export default api;
