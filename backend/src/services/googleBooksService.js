import axios from 'axios';
import AppError from '../utils/appError.js';

const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
const baseUrl = process.env.GOOGLE_BOOKS_API_URL;

// VERİ İŞLEME (DATA PROCESSING ON INGESTION): Google Books API'den gelen
// kategori stringlerini (örn: "Fiction / Science Fiction") daha yönetilebilir,
// tekil ve düz bir etiket dizisine dönüştürür. Bu, veritabanına tutarlı veri yazılmasını sağlar.
const processCategories = (rawCategories) => {
  if (!rawCategories || rawCategories.length === 0) {
    return [];
  }
  const allTags = new Set();
  rawCategories.forEach((categoryString) => {
    const tags = categoryString.split('/').map((tag) => tag.trim());
    tags.forEach((tag) => allTags.add(tag));
  });
  return Array.from(allTags);
};

export const searchBooks = async (query, page = 1, limit = 20) => {
  if (!apiKey || !baseUrl) {
    throw new AppError('Google Books API key or URL is not configured.', 500);
  }

  const startIndex = (page - 1) * limit;

  const requestParams = {
    q: `intitle:${query}`,
    key: apiKey,
    startIndex,
    maxResults: limit,
    printType: 'books',
  };

  try {
    console.log('Google Books API Request Params:', requestParams);
    let response = await axios.get(baseUrl, {
      params: requestParams,
    });

    // REAKTİF TEKRAR DENEME MEKANİZMASI (REACTIVE RETRY LOGIC):
    // Google Books API bazen sayfalama limitlerinde (maxResults) beklenmedik durumlar yaratabilir.
    // Eğer API, toplam öğe sayısı limitimizden az olmasına rağmen boş sonuç dönerse,
    // gerçek toplam öğe sayısı kadar maxResults ile tekrar deneme yaparak eksik veriyi önleriz.
    if (
      !response.data.items &&
      response.data.totalItems > 0 &&
      response.data.totalItems < limit
    ) {
      console.warn(
        'Pagination boundary hit. Retrying with adjusted maxResults.'
      );
      const retryParams = {
        ...requestParams,
        maxResults: response.data.totalItems,
      };
      response = await axios.get(baseUrl, { params: retryParams });
    }

    const items = response.data.items || [];

    return items.map((item) => ({
      googleBooksId: item.id,
      title: item.volumeInfo.title,
      subtitle: item.volumeInfo.subtitle || null,
      authors: item.volumeInfo.authors || [],
      description: item.volumeInfo.description,
      pageCount: item.volumeInfo.pageCount,
      publishedDate: item.volumeInfo.publishedDate || null,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
      industryIdentifiers: item.volumeInfo.industryIdentifiers || [],
      categories: processCategories(item.volumeInfo.categories),
    }));
  } catch (error) {
    console.error('Error searching books on Google Books API:', error.message);
    throw new AppError(
      'Could not fetch books from Google Books API.',
      error.response ? error.response.status : 500
    );
  }
};

export const getBookById = async (googleBooksId) => {
  if (!apiKey || !baseUrl) {
    throw new AppError('Google Books API key or URL is not configured.', 500);
  }

  try {
    const response = await axios.get(`${baseUrl}/${googleBooksId}`, {
      params: {
        key: apiKey,
        printType: 'books',
      },
    });

    const item = response.data;
    return {
      googleBooksId: item.id,
      title: item.volumeInfo.title,
      subtitle: item.volumeInfo.subtitle || null,
      authors: item.volumeInfo.authors || [],
      description: item.volumeInfo.description,
      pageCount: item.volumeInfo.pageCount,
      publishedDate: item.volumeInfo.publishedDate || null,
      thumbnail: item.volumeInfo.imageLinks
        ? item.volumeInfo.imageLinks.thumbnail
        : null,
      categories: processCategories(item.volumeInfo.categories),
      industryIdentifiers: item.volumeInfo.industryIdentifiers || [],
    };
  } catch (error) {
    console.error(
      `Error fetching book by ID ${googleBooksId} from Google Books API:`,
      error.message
    );
    throw new AppError(
      `Could not fetch book with ID ${googleBooksId} from Google Books API.`,
      error.response ? error.response.status : 500
    );
  }
};
