# Knight Online Item Analizi ve Web Arayüzü

## Proje Hakkında

Bu proje, **Knight Online** oyunundaki itemlerin veri analizi ve
görselleştirilmesini içermektedir.

-   **Veri Toplama:** Item verileri, Web Scraping yöntemi ile
    **Kopazar.com** üzerinden elde edilmiştir.\
-   **Notebook Analizi:** `notebooks/` klasöründe yer alan Jupyter
    Notebook dosyası, analiz sürecini içermektedir. Notebook temizlenmiş
    ve portfolyoya uygun hale getirilmiştir.\
-   **Web Arayüzü:** Item verileri için kullanıcı dostu bir arayüz
    geliştirilmiştir.
    -   Frontend: **React**, **TailwindCSS**, **Vite**\
    -   Görselleştirme: **Recharts**, **Swiper**\
-   **Backend:** Başlangıçta PostgreSQL üzerinde çalıştırılmıştır.
    Portfolyo sunumu için statik bir yapıya dönüştürülmüştür.

------------------------------------------------------------------------

## Veri

-   `data/` klasöründe **150 item** içeren örnek bir JSON dosyası
    bulunmaktadır.\
-   Bu JSON dosyası, local veritabanından rastgele seçilen itemler
    kullanılarak oluşturulmuştur.\
-   Frontend, bu JSON verisi üzerine inşa edilmiştir.

------------------------------------------------------------------------

## Kurulum ve Çalıştırma

### Notebook

Gerekli bağımlılıkları yükleyin:

``` bash
pip install -r requirements.txt
```

Jupyter Notebook'u açarak çalıştırabilirsiniz:

``` bash
jupyter notebook
```

### Web Uygulaması

Gerekli bağımlılıkları yükleyin:

``` bash
yarn install
```

Geliştirme ortamında çalıştırmak için:

``` bash
yarn dev
```

Build almak için:

``` bash
yarn build
```

------------------------------------------------------------------------

## Notlar

-   Notebook sürecinde farklı denemeler yapılmış, bu nedenle bazı küçük
    tutarsızlıklar görülebilir. Ancak genel akış temizlenmiş ve tekrar
    çalıştırılabilir hale getirilmiştir.\
-   Çalışma sırasında öğrenme sürecine yönelik hatalar ve çözümler de
    doğal akışta yer almaktadır.

------------------------------------------------------------------------

## Kullanılan Teknolojiler

-   **Python:** pandas, numpy, matplotlib, seaborn, SQLAlchemy\
-   **JavaScript:** React, React Router, Recharts, Swiper\
-   **CSS:** TailwindCSS\
-   **Build Tool:** Vite

------------------------------------------------------------------------

👉 Bu proje hem **veri analizi** hem de **web geliştirme** becerilerimi
sergilemek için hazırlanmıştır.
