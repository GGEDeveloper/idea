/**
 * Serviço de Sincronização da API Geko
 * 
 * Responsável por sincronizar dados da API Geko XML com PostgreSQL,
 * aplicando todas as regras de negócio:
 * - Preços de fornecedor → preços ao cliente (com margem)
 * - Stock Geko → referência (+ stock local)
 * - EAN como chave primária
 * - Manter auditoria dos dados originais
 */

const pool = require('../../../db/index.cjs');
const GekoApiClient = require('./gekoApiClient.cjs');
const GekoDataParser = require('./gekoDataParser.cjs');

class GekoSyncService {
  constructor() {
    this.client = new GekoApiClient();
    this.parser = new GekoDataParser();
    this.marginPercentage = 30; // 30% margem padrão sobre preço fornecedor
    this.stats = {
      startTime: null,
      endTime: null,
      totalProducts: 0,
      newProducts: 0,
      updatedProducts: 0,
      errors: 0,
      pricesUpdated: 0,
      stockUpdated: 0
    };
  }

  /**
   * Executa sincronização completa da API Geko
   * @param {object} options - Opções de sincronização
   * @returns {Promise<object>} Estatísticas da sincronização
   */
  async syncFromGeko(options = {}) {
    const {
      fullSync = false,        // Se true, sincroniza todos os produtos
      batchSize = 100,         // Tamanho do lote para inserção
      applyPriceMargin = true, // Se deve aplicar margem nos preços
      updateStock = true       // Se deve atualizar stock
    } = options;

    console.log('🔄 === INICIANDO SINCRONIZAÇÃO GEKO ===');
    this._resetStats();
    this.stats.startTime = new Date();

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Buscar dados da API Geko
      console.log('📥 Buscando dados da API Geko...');
      const xmlData = await this.client.fetchProductsXml({ stream: true });
      
      // 2. Parse do XML
      console.log('⚡ Processando XML...');
      const parsedXml = await this.client.parseXmlToObject(xmlData);
      const products = this.parser.processGekoXml(parsedXml);
      
      this.stats.totalProducts = products.length;
      console.log(`📦 ${products.length} produtos a sincronizar`);

      // 3. Processar em lotes
      console.log('💾 Sincronizando com PostgreSQL...');
      await this._processBatches(client, products, batchSize, {
        applyPriceMargin,
        updateStock
      });

      await client.query('COMMIT');
      
      this.stats.endTime = new Date();
      this._logFinalStats();
      
      console.log('✅ Sincronização concluída com sucesso!');
      return this._getStats();

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro na sincronização:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Processa produtos em lotes para melhor performance
   * @param {object} client - Cliente PostgreSQL
   * @param {Array} products - Lista de produtos
   * @param {number} batchSize - Tamanho do lote
   * @param {object} options - Opções de processamento
   */
  async _processBatches(client, products, batchSize, options) {
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(products.length / batchSize);
      
      console.log(`📋 Processando lote ${batchNumber}/${totalBatches} (${batch.length} produtos)`);
      
      try {
        await this._processBatch(client, batch, options);
      } catch (error) {
        console.error(`❌ Erro no lote ${batchNumber}:`, error.message);
        this.stats.errors += batch.length;
      }
    }
  }

  /**
   * Processa um lote de produtos
   * @param {object} client - Cliente PostgreSQL
   * @param {Array} batch - Lote de produtos
   * @param {object} options - Opções de processamento
   */
  async _processBatch(client, batch, options) {
    for (const product of batch) {
      try {
        await this._syncSingleProduct(client, product, options);
      } catch (error) {
        console.error(`❌ Erro ao sincronizar produto ${product.ean}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Sincroniza um único produto
   * @param {object} client - Cliente PostgreSQL
   * @param {object} product - Produto da Geko
   * @param {object} options - Opções de sincronização
   */
  async _syncSingleProduct(client, product, options) {
    const { applyPriceMargin, updateStock } = options;

    // 1. Upsert na tabela products PRIMEIRO (devido à foreign key)
    const isNewProduct = await this._upsertMainProduct(client, product);
    if (isNewProduct) this.stats.newProducts++;
    else this.stats.updatedProducts++;

    // 2. Upsert na tabela geko_products (dados originais)
    await this._upsertGekoProduct(client, product);

    // 3. Atualizar preços (aplicando margem)
    if (applyPriceMargin && product.supplierPrice) {
      await this._updateProductPrice(client, product);
      this.stats.pricesUpdated++;
    }

    // 4. Atualizar stock (se especificado)
    if (updateStock) {
      await this._updateProductStock(client, product);
      this.stats.stockUpdated++;
    }

    // 5. Atualizar categorias e imagens se necessário
    await this._updateProductRelations(client, product);
  }

  /**
   * Faz upsert na tabela geko_products
   * @param {object} client - Cliente PostgreSQL
   * @param {object} product - Produto da Geko
   */
  async _upsertGekoProduct(client, product) {
    const query = `
      INSERT INTO geko_products (
        ean, supplier_price, stock_quantity, raw_data, last_sync
      ) VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (ean) 
      DO UPDATE SET
        supplier_price = EXCLUDED.supplier_price,
        stock_quantity = EXCLUDED.stock_quantity,
        raw_data = EXCLUDED.raw_data,
        last_sync = NOW(),
        updated_at = NOW()
    `;

    await client.query(query, [
      product.ean,
      product.supplierPrice,
      product.stockQuantity,
      JSON.stringify(product.rawData)
    ]);
  }

  /**
   * Faz upsert na tabela products principal
   * @param {object} client - Cliente PostgreSQL
   * @param {object} product - Produto da Geko
   * @returns {boolean} True se é produto novo
   */
  async _upsertMainProduct(client, product) {
    // Verificar se produto já existe
    const existsQuery = 'SELECT ean FROM products WHERE ean = $1';
    const existsResult = await client.query(existsQuery, [product.ean]);
    const isNew = existsResult.rows.length === 0;

    const query = `
      INSERT INTO products (
        ean, name, shortdescription, longdescription, brand, active
      ) VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (ean)
      DO UPDATE SET
        name = EXCLUDED.name,
        shortdescription = EXCLUDED.shortdescription,
        longdescription = EXCLUDED.longdescription,
        brand = EXCLUDED.brand,
        updated_at = NOW()
    `;

    await client.query(query, [
      product.ean,
      product.name,
      product.shortDescription,
      product.longDescription,
      product.brand
    ]);

    return isNew;
  }

  /**
   * Atualiza preço aplicando margem
   * @param {object} client - Cliente PostgreSQL
   * @param {object} product - Produto da Geko
   */
  async _updateProductPrice(client, product) {
    if (!product.supplierPrice) return;

    // Calcular preço final com margem
    const finalPrice = product.supplierPrice * (1 + this.marginPercentage / 100);

    // Buscar ou criar lista de preços "Preço Cliente"
    const priceListQuery = `
      INSERT INTO price_lists (name, description)
      VALUES ('Preço Cliente', 'Preços com margem aplicada sobre fornecedor')
      ON CONFLICT (name) DO NOTHING
      RETURNING price_list_id
    `;
    await client.query(priceListQuery);

    // Buscar ID da lista de preços
    const listIdQuery = 'SELECT price_list_id FROM price_lists WHERE name = $1';
    const listIdResult = await client.query(listIdQuery, ['Preço Cliente']);
    const priceListId = listIdResult.rows[0].price_list_id;

    // Upsert do preço
    const priceQuery = `
      INSERT INTO prices (product_ean, price_list_id, price)
      VALUES ($1, $2, $3)
      ON CONFLICT (product_ean, price_list_id)
      DO UPDATE SET
        price = EXCLUDED.price
    `;

    await client.query(priceQuery, [product.ean, priceListId, finalPrice]);
  }

  /**
   * Atualiza stock do produto
   * @param {object} client - Cliente PostgreSQL
   * @param {object} product - Produto da Geko
   */
  async _updateProductStock(client, product) {
    // Criar/atualizar variant principal do produto
    const variantQuery = `
      INSERT INTO product_variants (variantid, ean, name, stockquantity)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (variantid)
      DO UPDATE SET
        stockquantity = EXCLUDED.stockquantity
    `;

    const variantId = `${product.ean}-default`;
    await client.query(variantQuery, [
      variantId,
      product.ean,
      'Geko Stock',
      product.stockQuantity || 0
    ]);
  }

  /**
   * Atualiza relações do produto (categorias, imagens)
   * @param {object} client - Cliente PostgreSQL
   * @param {object} product - Produto da Geko
   */
  async _updateProductRelations(client, product) {
    // Atualizar categoria se existir
    if (product.category) {
      // Aqui implementaríamos lógica de categorias
      // Por agora, apenas log
      // console.log(`Categoria para ${product.ean}: ${product.category}`);
    }

    // Atualizar imagem se existir
    if (product.imageUrl) {
      // Verificar se já existe imagem para este produto
      const existsQuery = 'SELECT imageid FROM product_images WHERE ean = $1 AND url = $2';
      const existsResult = await client.query(existsQuery, [product.ean, product.imageUrl]);
      
      if (existsResult.rows.length === 0) {
        const imageQuery = `
          INSERT INTO product_images (ean, url, alt, is_primary)
          VALUES ($1, $2, $3, true)
        `;

        await client.query(imageQuery, [
          product.ean,
          product.imageUrl,
          product.name || 'Produto Geko'
        ]);
      }
    }
  }

  /**
   * Reset das estatísticas
   */
  _resetStats() {
    this.stats = {
      startTime: null,
      endTime: null,
      totalProducts: 0,
      newProducts: 0,
      updatedProducts: 0,
      errors: 0,
      pricesUpdated: 0,
      stockUpdated: 0
    };
  }

  /**
   * Log das estatísticas finais
   */
  _logFinalStats() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    
    console.log('\n🏁 === SINCRONIZAÇÃO CONCLUÍDA ===');
    console.log(`⏱️  Duração: ${duration.toFixed(1)}s`);
    console.log(`📦 Total processado: ${this.stats.totalProducts}`);
    console.log(`🆕 Novos produtos: ${this.stats.newProducts}`);
    console.log(`🔄 Produtos atualizados: ${this.stats.updatedProducts}`);
    console.log(`💰 Preços atualizados: ${this.stats.pricesUpdated}`);
    console.log(`📊 Stock atualizado: ${this.stats.stockUpdated}`);
    console.log(`❌ Erros: ${this.stats.errors}`);
    
    const successRate = ((this.stats.totalProducts - this.stats.errors) / this.stats.totalProducts * 100).toFixed(1);
    console.log(`✅ Taxa de sucesso: ${successRate}%`);
    console.log('======================================\n');
  }

  /**
   * Retorna estatísticas da sincronização
   * @returns {object} Estatísticas
   */
  _getStats() {
    return { ...this.stats };
  }

  /**
   * Configura percentual de margem
   * @param {number} percentage - Percentual de margem
   */
  setMarginPercentage(percentage) {
    this.marginPercentage = percentage;
    console.log(`💰 Margem configurada para ${percentage}%`);
  }
}

module.exports = GekoSyncService; 