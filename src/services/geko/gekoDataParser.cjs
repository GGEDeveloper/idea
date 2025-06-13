/**
 * Parser de Dados da API Geko XML
 * 
 * Responsável por extrair dados específicos do XML da Geko e transformá-los
 * numa estrutura adequada para inserção no PostgreSQL.
 * 
 * REGRAS DE PARSING:
 * - EAN é sempre a chave primária
 * - Preços extraídos são de fornecedor (aplicar margem depois)
 * - Stock da Geko é apenas referência (podemos ter stock local)
 * - Manter dados originais em JSONB para auditoria
 */

class GekoDataParser {
  constructor() {
    this.stats = {
      totalProducts: 0,
      successfulParses: 0,
      failedParses: 0,
      missingEAN: 0,
      missingPrice: 0,
      missingStock: 0
    };
  }

  /**
   * Extrai lista de produtos do XML parseado da Geko
   * @param {object} parsedXml - Objeto JavaScript do XML parseado
   * @returns {Array} Lista de produtos extraídos
   */
  extractProducts(parsedXml) {
    try {
      // A estrutura do XML da Geko pode variar, vamos tentar múltiplos caminhos
      let products = [];
      
      // Estrutura Geko real: offer > products > product  
      if (parsedXml?.offer?.products?.product) {
        products = Array.isArray(parsedXml.offer.products.product) 
          ? parsedXml.offer.products.product 
          : [parsedXml.offer.products.product];
      }
      // Estrutura alternativa: offer > products (array direto)
      else if (parsedXml?.offer?.products && Array.isArray(parsedXml.offer.products)) {
        products = parsedXml.offer.products;
      }
      // Estrutura Geko: offer > ofertas > oferta
      else if (parsedXml?.offer?.ofertas?.oferta) {
        products = Array.isArray(parsedXml.offer.ofertas.oferta) 
          ? parsedXml.offer.ofertas.oferta 
          : [parsedXml.offer.ofertas.oferta];
      }
      // Estrutura alternativa: offer > oferta
      else if (parsedXml?.offer?.oferta) {
        products = Array.isArray(parsedXml.offer.oferta) 
          ? parsedXml.offer.oferta 
          : [parsedXml.offer.oferta];
      }
      // Caminho comum: root > products > product
      else if (parsedXml?.products?.product) {
        products = Array.isArray(parsedXml.products.product) 
          ? parsedXml.products.product 
          : [parsedXml.products.product];
      }
      // Caminho alternativo: root > product
      else if (parsedXml?.product) {
        products = Array.isArray(parsedXml.product) 
          ? parsedXml.product 
          : [parsedXml.product];
      }
      // Caminho alternativo: root > items > item
      else if (parsedXml?.items?.item) {
        products = Array.isArray(parsedXml.items.item) 
          ? parsedXml.items.item 
          : [parsedXml.items.item];
      }
      
      console.log(`[GekoParser] Encontrados ${products.length} produtos no XML`);
      return products;
      
    } catch (error) {
      console.error('[GekoParser] Erro ao extrair produtos do XML:', error.message);
      return [];
    }
  }

  /**
   * Normaliza um único produto da Geko para o formato da nossa BD
   * @param {object} gekoProduct - Produto raw da API Geko
   * @returns {object|null} Produto normalizado ou null se inválido
   */
  normalizeProduct(gekoProduct) {
    try {
      // Extrair EAN (várias possibilidades)
      const ean = this._extractEAN(gekoProduct);
      if (!ean) {
        this.stats.missingEAN++;
        console.warn('[GekoParser] Produto sem EAN válido:', gekoProduct);
        return null;
      }

      // Extrair informações básicas (estrutura real da Geko)
      const name = gekoProduct.description?.name || 
                   this._extractText(gekoProduct, ['name', 'product_name', 'title', 'nazwa']);
                   
      const brand = gekoProduct.producer?.name || 
                    this._extractText(gekoProduct, ['brand', 'marka', 'producer']);
                    
      const shortDescription = gekoProduct.description?.short_desc?.text ||
                               this._extractText(gekoProduct, ['short_description', 'description_short', 'opis_krotki']);
                               
      const longDescription = gekoProduct.description?.long_desc?.text ||
                              gekoProduct.description?.description ||
                              this._extractText(gekoProduct, ['long_description', 'description', 'opis']);

      // Extrair preço de fornecedor
      const supplierPrice = this._extractPrice(gekoProduct);
      if (!supplierPrice) {
        this.stats.missingPrice++;
      }

      // Extrair stock
      const stockQuantity = this._extractStock(gekoProduct);
      if (stockQuantity === null) {
        this.stats.missingStock++;
      }

      // Extrair categoria (estrutura real da Geko)
      const category = gekoProduct.category?.name ||
                       gekoProduct.category?.path ||
                       this._extractText(gekoProduct, ['category', 'kategoria', 'category_name']);

      // Extrair imagens (estrutura real da Geko)
      let imageUrl = null;
      if (gekoProduct.images?.large?.image) {
        const image = gekoProduct.images.large.image;
        if (Array.isArray(image) && image.length > 0) {
          imageUrl = image[0].url || image[0].text || image[0];
        } else if (typeof image === 'object') {
          imageUrl = image.url || image.text;
        } else {
          imageUrl = image;
        }
      }
      
      if (!imageUrl) {
        imageUrl = this._extractText(gekoProduct, ['image', 'photo', 'zdjecie', 'img_url']);
      }

      const normalizedProduct = {
        ean,
        name: name || 'Produto sem nome',
        brand,
        shortDescription,
        longDescription,
        category,
        imageUrl,
        supplierPrice,
        stockQuantity: stockQuantity || 0,
        rawData: gekoProduct, // Manter dados originais para auditoria
        lastSync: new Date().toISOString()
      };

      this.stats.successfulParses++;
      return normalizedProduct;

    } catch (error) {
      this.stats.failedParses++;
      console.error('[GekoParser] Erro ao normalizar produto:', error.message, gekoProduct);
      return null;
    }
  }

  /**
   * Extrai EAN de várias possibilidades no objeto do produto
   * @param {object} product - Produto da Geko
   * @returns {string|null} EAN válido ou null
   */
  _extractEAN(product) {
    // Primeira tentativa: sizes.size.code (estrutura real da Geko)
    if (product.sizes && product.sizes.size && product.sizes.size.code) {
      let value = product.sizes.size.code.toString().trim();
      // Validar se parece EAN (8-14 dígitos)
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length >= 8 && numericValue.length <= 14) {
        return numericValue;
      }
      // Se tem caracteres alfanuméricos mas não é EAN, pode ser SKU válido
      if (value.length >= 5 && value.length <= 20) {
        return value;
      }
    }

    // Segunda tentativa: campo code direto
    if (product.code) {
      let value = product.code.toString().trim();
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length >= 8 && numericValue.length <= 14) {
        return numericValue;
      }
      if (value.length >= 5 && value.length <= 20) {
        return value;
      }
    }

    // Terceira tentativa: campos tradicionais
    const eanFields = [
      'ean', 'EAN', 'ean13', 'EAN13',
      'barcode', 'kod_kreskowy', 'gtin',
      'id', 'product_id', 'sku'
    ];

    for (const field of eanFields) {
      let value = this._extractText(product, [field]);
      if (value) {
        // Limpar e validar EAN
        value = value.toString().trim().replace(/\D/g, ''); // Só números
        if (value.length >= 8 && value.length <= 14) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Extrai preço de várias possibilidades
   * @param {object} product - Produto da Geko
   * @returns {number|null} Preço como decimal ou null
   */
  _extractPrice(product) {
    // Primeira tentativa: estrutura real da Geko
    if (product.price) {
      // Preferir preço gross (com impostos)
      if (product.price.gross && product.price.gross > 0) {
        return parseFloat(product.price.gross);
      }
      // Fallback para preço net
      if (product.price.net && product.price.net > 0) {
        return parseFloat(product.price.net);
      }
    }

    // Segunda tentativa: price dentro de sizes.size
    if (product.sizes && product.sizes.size && product.sizes.size.price) {
      const sizePrice = product.sizes.size.price;
      if (sizePrice.gross && sizePrice.gross > 0) {
        return parseFloat(sizePrice.gross);
      }
      if (sizePrice.net && sizePrice.net > 0) {
        return parseFloat(sizePrice.net);
      }
    }

    // Terceira tentativa: campos tradicionais
    const priceFields = [
      'price', 'cena', 'price_net', 'cena_netto',
      'price_gross', 'cena_brutto', 'cost',
      'supplier_price', 'wholesale_price'
    ];

    for (const field of priceFields) {
      const value = this._extractText(product, [field]);
      if (value) {
        // Converter para número (aceitar vírgula e ponto)
        const numericValue = parseFloat(value.toString().replace(',', '.').replace(/[^\d.-]/g, ''));
        if (!isNaN(numericValue) && numericValue > 0) {
          return numericValue;
        }
      }
    }

    return null;
  }

  /**
   * Extrai quantidade de stock
   * @param {object} product - Produto da Geko
   * @returns {number|null} Quantidade de stock ou null
   */
  _extractStock(product) {
    // Primeira tentativa: stock dentro de sizes.size (estrutura real da Geko)
    if (product.sizes && product.sizes.size && product.sizes.size.stock) {
      const stockData = product.sizes.size.stock;
      
      // Stock pode ser objeto com propriedades ou valor direto
      if (typeof stockData === 'object') {
        // Tentar várias propriedades possíveis
        const stockProps = ['quantity', 'available', 'total', 'value', 'amount', 'stock'];
        for (const prop of stockProps) {
          if (stockData[prop] !== undefined) {
            const numericValue = parseInt(stockData[prop].toString().replace(/\D/g, ''), 10);
            if (!isNaN(numericValue) && numericValue >= 0) {
              return numericValue;
            }
          }
        }
      } else {
        // Stock é valor direto
        const numericValue = parseInt(stockData.toString().replace(/\D/g, ''), 10);
        if (!isNaN(numericValue) && numericValue >= 0) {
          return numericValue;
        }
      }
    }

    // Segunda tentativa: campos tradicionais
    const stockFields = [
      'stock', 'stan', 'quantity', 'ilosc',
      'stock_quantity', 'available', 'dostepne',
      'in_stock', 'magazyn'
    ];

    for (const field of stockFields) {
      const value = this._extractText(product, [field]);
      if (value !== null && value !== undefined) {
        const numericValue = parseInt(value.toString().replace(/\D/g, ''), 10);
        if (!isNaN(numericValue) && numericValue >= 0) {
          return numericValue;
        }
      }
    }

    return null;
  }

  /**
   * Extrai texto de um campo, tentando múltiplas possibilidades
   * @param {object} obj - Objeto a pesquisar
   * @param {Array} fields - Lista de campos possíveis
   * @returns {string|null} Valor encontrado ou null
   */
  _extractText(obj, fields) {
    for (const field of fields) {
      if (obj[field] !== undefined && obj[field] !== null) {
        const value = obj[field];
        // Se é objeto com propriedade 'text'
        if (typeof value === 'object' && value.text) {
          return value.text.toString().trim();
        }
        // Se é string ou número direto
        if (typeof value === 'string' || typeof value === 'number') {
          return value.toString().trim();
        }
      }
    }
    return null;
  }

  /**
   * Processa XML completo da Geko e retorna produtos normalizados
   * @param {object} parsedXml - XML parseado da API Geko
   * @returns {Array} Lista de produtos normalizados
   */
  processGekoXml(parsedXml) {
    console.log('[GekoParser] Iniciando processamento do XML da Geko...');
    
    // Reset das estatísticas
    this.stats = {
      totalProducts: 0,
      successfulParses: 0,
      failedParses: 0,
      missingEAN: 0,
      missingPrice: 0,
      missingStock: 0
    };

    const rawProducts = this.extractProducts(parsedXml);
    this.stats.totalProducts = rawProducts.length;

    const normalizedProducts = [];

    for (const rawProduct of rawProducts) {
      const normalized = this.normalizeProduct(rawProduct);
      if (normalized) {
        normalizedProducts.push(normalized);
      }
    }

    this._logStatistics();
    
    console.log(`[GekoParser] ✅ Processamento concluído: ${normalizedProducts.length} produtos válidos`);
    return normalizedProducts;
  }

  /**
   * Imprime estatísticas do parsing
   */
  _logStatistics() {
    console.log('\n[GekoParser] === ESTATÍSTICAS DE PARSING ===');
    console.log(`Total de produtos no XML: ${this.stats.totalProducts}`);
    console.log(`Produtos parseados com sucesso: ${this.stats.successfulParses}`);
    console.log(`Produtos com falha no parse: ${this.stats.failedParses}`);
    console.log(`Produtos sem EAN: ${this.stats.missingEAN}`);
    console.log(`Produtos sem preço: ${this.stats.missingPrice}`);
    console.log(`Produtos sem stock: ${this.stats.missingStock}`);
    
    const successRate = ((this.stats.successfulParses / this.stats.totalProducts) * 100).toFixed(1);
    console.log(`Taxa de sucesso: ${successRate}%`);
    console.log('==========================================\n');
  }

  /**
   * Retorna estatísticas atuais do parsing
   * @returns {object} Objeto com estatísticas
   */
  getStats() {
    return { ...this.stats };
  }
}

module.exports = GekoDataParser; 