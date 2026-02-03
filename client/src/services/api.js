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
  lastUpdated: new Date().toISOString(),
};

const MOCK_PRODUCTS = [
  { id: 1, name: 'Laptop Gamer X1', priceUsd: 850.00, category: 'Computación' },
  { id: 2, name: 'Mouse Inalámbrico', priceUsd: 15.50, category: 'Periféricos' },
  { id: 3, name: 'Monitor 24" 144Hz', priceUsd: 180.00, category: 'Monitores' },
  { id: 4, name: 'Teclado Mecánico RGB', priceUsd: 45.00, category: 'Periféricos' },
  { id: 5, name: 'Auriculares Bluetooth', priceUsd: 35.00, category: 'Audio' },
  { id: 6, name: 'Placa de Video RTX 4060', priceUsd: 320.00, category: 'Componentes' },
  { id: 7, name: 'Procesador Ryzen 5', priceUsd: 150.00, category: 'Componentes' },
  { id: 8, name: 'Memoria RAM 16GB DDR4', priceUsd: 40.00, category: 'Componentes' },
];

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

      // POST /admin/config
      if (method === 'post' && url.includes('/admin/config')) {
        const newConfig = JSON.parse(data);
        if (newConfig.profitMargin) MOCK_CONFIG.profitMargin = newConfig.profitMargin;
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
