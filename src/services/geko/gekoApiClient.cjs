/**
 * Cliente para API Geko XML
 * 
 * Responsável por fazer requisições à API Geko XML e tratar rate limiting,
 * timeouts e outros aspectos técnicos.
 * 
 * REGRAS IMPORTANTES:
 * - Usar sempre a versão em inglês da API
 * - Respeitar rate limits (não fazer requests por segundos)
 * - EAN é a única chave confiável
 * - Preços são de fornecedor (aplicar margem)
 */

const https = require('https');
const { XMLParser } = require('fast-xml-parser');

class GekoApiClient {
  constructor() {
    this.apiKey = '4bceff60-32d7-4635-b5e8-ca51353a6e0e';
    this.baseUrl = 'https://b2b.geko.pl/en/xmlapi/20/3';
    this.lastRequestTime = 0;
    this.minTimeBetweenRequests = 5000; // 5 segundos entre requests
    
    // Configuração do parser XML
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: 'text',
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true
    });
  }

  /**
   * Aplica rate limiting para respeitar as regras da API Geko
   */
  async _waitForRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const waitTime = this.minTimeBetweenRequests - timeSinceLastRequest;
    
    if (waitTime > 0) {
      console.log(`[GekoAPI] Aguardando ${waitTime}ms para respeitar rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Faz requisição HTTP à API Geko
   * @param {string} endpoint - Endpoint específico (ex: 'utf8_withoutbom')
   * @param {object} params - Parâmetros adicionais (filters, etc)
   * @returns {Promise<string>} XML response como string
   */
  async _makeRequest(endpoint = 'utf8', params = {}) {
    await this._waitForRateLimit();
    
    let url = `${this.baseUrl}/${endpoint}/${this.apiKey}`;
    
    // Adicionar parâmetros se fornecidos
    const queryParams = new URLSearchParams(params);
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    console.log(`[GekoAPI] Fazendo requisição para: ${url}`);
    
    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        timeout: 60000, // 60 segundos timeout
        headers: {
          'User-Agent': 'Geko-Clone-B2B/1.0',
          'Accept': 'application/xml, text/xml'
        }
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            console.log(`[GekoAPI] Requisição concluída com sucesso. Tamanho: ${data.length} chars`);
            resolve(data);
          } else if (response.statusCode === 403) {
            reject(new Error('API Key banida temporariamente. Muitas requisições frequentes.'));
          } else {
            reject(new Error(`Erro HTTP ${response.statusCode}: ${response.statusMessage}`));
          }
        });
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Timeout na requisição à API Geko'));
      });
      
      request.on('error', (error) => {
        reject(new Error(`Erro de rede: ${error.message}`));
      });
    });
  }

  /**
   * Busca todos os produtos da API Geko em XML
   * @param {object} options - Opções da requisição (filtros, formato)
   * @returns {Promise<string>} XML completo da API
   */
  async fetchProductsXml(options = {}) {
    const {
      filters = null,        // IDs de features para incluir
      exfilters = null,      // IDs de features para excluir
      stream = false,        // Retornar como stream
      endpoint = 'utf8'      // Formato da encoding
    } = options;
    
    const params = {};
    if (filters) params.filters = filters;
    if (exfilters) params.exfilters = exfilters;
    if (stream) params.stream = 'true';
    
    try {
      const xmlData = await this._makeRequest(endpoint, params);
      
      // Validação básica do XML
      if (!xmlData || xmlData.trim().length === 0) {
        throw new Error('Resposta XML vazia da API Geko');
      }
      
      if (!xmlData.includes('<?xml')) {
        throw new Error('Resposta não parece ser XML válido');
      }
      
      return xmlData;
      
    } catch (error) {
      console.error('[GekoAPI] Erro ao buscar produtos:', error.message);
      throw error;
    }
  }

  /**
   * Converte XML da API Geko para objeto JavaScript
   * @param {string} xmlData - XML string da API
   * @returns {Promise<object>} Objeto JavaScript parseado
   */
  async parseXmlToObject(xmlData) {
    try {
      console.log('[GekoAPI] Fazendo parse do XML...');
      const parsedData = this.xmlParser.parse(xmlData);
      
      if (!parsedData) {
        throw new Error('Falha no parse do XML');
      }
      
      console.log('[GekoAPI] Parse XML concluído com sucesso');
      return parsedData;
      
    } catch (error) {
      console.error('[GekoAPI] Erro no parse XML:', error.message);
      throw new Error(`Erro ao parsear XML: ${error.message}`);
    }
  }

  /**
   * Testa a conectividade com a API Geko
   * @returns {Promise<boolean>} True se a API estiver acessível
   */
  async testConnection() {
    try {
      console.log('[GekoAPI] Testando conexão com API Geko...');
      
      // Faz uma requisição pequena para testar
      const xmlData = await this._makeRequest('utf8', { stream: 'true' });
      
      if (xmlData && xmlData.includes('<?xml')) {
        console.log('[GekoAPI] ✅ Conexão com API Geko bem-sucedida');
        return true;
      } else {
        console.log('[GekoAPI] ❌ Resposta inesperada da API Geko');
        return false;
      }
      
    } catch (error) {
      console.error('[GekoAPI] ❌ Falha na conexão:', error.message);
      return false;
    }
  }
}

module.exports = GekoApiClient; 