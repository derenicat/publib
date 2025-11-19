class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ['page', 'sort', 'limit', 'fields', 'q'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // BİRDEN ÇOK DEĞERLİ FİLTRELEME (MULTI-VALUE FILTERING)
    // URL'den gelen filtre parametreleri iki şekilde olabilir:
    // 1. Tekrarlayan parametre: ?category=Roman&category=Bilim Kurgu
    // 2. Virgülle ayrılmış: ?category=Roman,Bilim Kurgu
    // Bu blok, her iki formatı da Mongoose'un anladığı `$all` operatörüne dönüştürür.
    // `$all` operatörü, bir belgenin belirtilen *tüm* değerleri içermesini zorunlu kılar.
    // Böylece kullanıcı, hem "Roman" hem de "Bilim Kurgu" kategorisindeki kitapları arayabilir.
    for (const key in queryObj) {
      let values;
      if (Array.isArray(queryObj[key])) {
        values = queryObj[key];
      } else if (typeof queryObj[key] === 'string' && queryObj[key].includes(',')) {
        values = queryObj[key].split(',').map(val => val.trim());
      }

      if (values) {
        queryObj[key] = { $all: values };
      }
    }

    // GELİŞMİŞ FİLTRELEME (ADVANCED FILTERING)
    // URL'den gelen 'gte', 'gt', 'lte', 'lt' gibi karşılaştırma operatörlerini,
    // Mongoose'un sorgu dilindeki karşılıkları olan '$gte', '$gt', '$lte', '$lt'
    // operatörlerine dönüştürüyoruz. Bu, API kullanıcılarının sayısal alanlarda
    // (örneğin, yayın yılı, sayfa sayısı) aralık bazlı sorgular yapmasını sağlar.
    // Örn: /api/books?publicationYear[gte]=2020 -> { publicationYear: { $gte: 2020 } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let finalQuery = JSON.parse(queryStr);

    // KELİME BAZLI METİN ARAMA (WORD-BASED TEXT SEARCH)
    // 'q' parametresi ile gelen arama metnini kelimelere ayırıyoruz.
    // Oluşturulan Regex, bu kelimelerin *tümünün*, belgenin başlık (title) veya
    // alt başlık (subtitle) alanlarında geçmesini zorunlu kılar, ancak kelimelerin sırası önemli değildir.
    // Bu, "Harry Potter" aramasının "Potter Harry" ile aynı sonucu vermesini sağlar.
    // (?=.*word1)(?=.*word2) yapısı, her kelimenin varlığını bağımsız olarak kontrol eder.
    if (this.queryString.q) {
      const words = this.queryString.q
        .split(' ')
        .filter((word) => word.length > 0);
      const regex = new RegExp(
        words.map((word) => `(?=.*${word})`).join(''),
        'i'
      );

      const searchQuery = {
        $or: [{ title: { $regex: regex } }, { subtitle: { $regex: regex } }],
      };
      finalQuery = { ...finalQuery, ...searchQuery };
    }

    this.query = this.query.find(finalQuery);

    return this;
  }

  sort() {
    // URL'den gelen 'sort' parametresine göre sıralama yapar.
    // Örn: ?sort=price,-ratingsAverage -> fiyata göre artan, puana göre azalan sıralama.
    // Eğer bir sıralama belirtilmemişse, varsayılan olarak en yeni eklenenleri
    // en üstte gösterecek şekilde sıralar.
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 'fields' parametresi ile sadece istenen alanların getirilmesini sağlar (projection).
    // Bu, veri transferini azaltır ve performansı artırır.
    // Örn: ?fields=title,author -> Sadece başlık ve yazar bilgisini getir.
    // Varsayılan olarak, Mongoose'un eklediği '__v' alanı hariç tutulur.
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // Sayfalama (pagination) mantığını uygular.
    // Kullanıcının büyük veri setleri arasında sayfa sayfa gezinmesini sağlar.
    // Varsayılan olarak 1. sayfayı ve sayfa başına 100 sonuç gösterir.
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
